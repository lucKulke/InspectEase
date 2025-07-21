from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List
import asyncio
import time
import os
from collections import defaultdict

import dotenv
dotenv.load_dotenv()

app = FastAPI()

ACCESS_TOKEN = os.getenv("ACCESS_TOKEN", "super-secret-token")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================================
# Data structure:
# { formId: { userId: { sessionId: { "timestamp": float, "role": "active" | "monitor" } } } }
# ======================================
active_form_sessions: Dict[str, Dict[str, Dict[str, Dict[str, str]]]] = {}

# ======================================
# Connection Managers
# ======================================
class DashboardConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast_active_forms(self):
        active_forms = []
        for form_id, users in active_form_sessions.items():
            if not users:
                continue

            all_timestamps = [
                s["timestamp"] for sessions in users.values() for s in sessions.values()
            ]
            active_forms.append({
                "formId": form_id,
                "users": list(users.keys()),
                "activeUsers": len(users),
                "lastActive": max(all_timestamps) if all_timestamps else None
            })

        for connection in self.active_connections:
            try:
                await connection.send_json({"type": "active_forms_update", "data": active_forms})
            except Exception:
                pass


class FormConnectionManager:
    def __init__(self):
        self.form_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, form_id: str):
        await websocket.accept()
        if form_id not in self.form_connections:
            self.form_connections[form_id] = []
        self.form_connections[form_id].append(websocket)

    def disconnect(self, websocket: WebSocket, form_id: str):
        if form_id in self.form_connections and websocket in self.form_connections[form_id]:
            self.form_connections[form_id].remove(websocket)
            if not self.form_connections[form_id]:
                del self.form_connections[form_id]

    async def broadcast_form_update(self, form_id: str):
        if form_id not in active_form_sessions:
            return

        users = {
            user_id: {
                "sessions": {sid: s["role"] for sid, s in sessions.items()}
            }
            for user_id, sessions in active_form_sessions[form_id].items()
        }

        data = {
            "type": "form_users_update",
            "formId": form_id,
            "users": users,
            "activeUsers": len(users),
        }

        for connection in self.form_connections.get(form_id, []):
            try:
                await connection.send_json({"type": "form_update", "data": data})
            except Exception:
                pass


dashboard_manager = DashboardConnectionManager()
form_manager = FormConnectionManager()

# ======================================
# Models
# ======================================
class FormSession(BaseModel):
    form_id: str
    user_id: str
    session_id: str
    takeover: bool = False  # New field to allow takeover


# ======================================
# Background Task: Clean stale sessions
# ======================================
async def cleanup_stale_sessions():
    while True:
        try:
            current_time = time.time()
            forms_updated = False

            for form_id, users in list(active_form_sessions.items()):
                for user_id, sessions in list(users.items()):
                    for session_id, data in list(sessions.items()):
                        if current_time - data["timestamp"] > 3:  # timeout
                            active_form_sessions[form_id][user_id].pop(session_id)
                            forms_updated = True

                    # If no sessions remain for this user
                    if not active_form_sessions[form_id][user_id]:
                        active_form_sessions[form_id].pop(user_id)
                        forms_updated = True
                    else:
                        # Ensure at least one session is active
                        if not any(s["role"] == "active" for s in active_form_sessions[form_id][user_id].values()):
                            for sid in active_form_sessions[form_id][user_id]:
                                active_form_sessions[form_id][user_id][sid]["role"] = "active"
                                break

                if not active_form_sessions[form_id]:
                    active_form_sessions.pop(form_id)
                    forms_updated = True

            if forms_updated:
                await dashboard_manager.broadcast_active_forms()
                for form_id in form_manager.form_connections.keys():
                    await form_manager.broadcast_form_update(form_id)

            await asyncio.sleep(1)
        except Exception as e:
            print(f"Cleanup error: {e}")
            await asyncio.sleep(1)


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(cleanup_stale_sessions())


# ======================================
# WebSocket Endpoints
# ======================================
@app.websocket("/ws/dashboard")
async def dashboard_websocket(websocket: WebSocket, token: str = Query(None)):
    if token != ACCESS_TOKEN:
        await websocket.close(code=1008)
        return
    await dashboard_manager.connect(websocket)
    try:
        await dashboard_manager.broadcast_active_forms()
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        dashboard_manager.disconnect(websocket)


@app.websocket("/ws/form/{form_id}")
async def form_websocket(websocket: WebSocket, form_id: str, token: str = Query(None)):
    if token != ACCESS_TOKEN:
        await websocket.close(code=1008)
        return
    await form_manager.connect(websocket, form_id)
    try:
        await form_manager.broadcast_form_update(form_id)
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        form_manager.disconnect(websocket, form_id)


# ======================================
# API Endpoint to update activity
# ======================================
@app.post("/api/form-activity")
async def update_form_activity(session: FormSession, background_tasks: BackgroundTasks, token: str = Query(None)):
    if token != ACCESS_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")

    form_id, user_id, session_id = session.form_id, session.user_id, session.session_id

    if form_id not in active_form_sessions:
        active_form_sessions[form_id] = {}

    if user_id not in active_form_sessions[form_id]:
        active_form_sessions[form_id][user_id] = {}

    user_sessions = active_form_sessions[form_id][user_id]

    # ✅ If session exists, keep its role and just update timestamp
    if session_id in user_sessions:
        user_sessions[session_id]["timestamp"] = time.time()
    else:
        # ✅ New session: Assign role carefully
        has_active = any(s["role"] == "active" for s in user_sessions.values())
        role = "monitor" if has_active else "active"
        user_sessions[session_id] = {"timestamp": time.time(), "role": role}

    # Broadcast update only if a new session was added
    background_tasks.add_task(dashboard_manager.broadcast_active_forms)
    background_tasks.add_task(form_manager.broadcast_form_update, form_id)

    return {"status": "success", "role": user_sessions[session_id]["role"]}


class TakeoverRequest(BaseModel):
    form_id: str
    user_id: str
    session_id: str
@app.post("/api/takeover")
async def takeover_session(req: TakeoverRequest, background_tasks: BackgroundTasks, token: str = Query(None)):
    if token != ACCESS_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")

    form_id, user_id, session_id = req.form_id, req.user_id, req.session_id

    # Validate
    if form_id not in active_form_sessions or user_id not in active_form_sessions[form_id]:
        raise HTTPException(status_code=404, detail="User or form not found")

    user_sessions = active_form_sessions[form_id][user_id]

    if session_id not in user_sessions:
        raise HTTPException(status_code=404, detail="Session not found")

    # Set all sessions for user to monitor
    for sid in user_sessions:
        user_sessions[sid]["role"] = "monitor"

    # Set this session as active
    user_sessions[session_id]["role"] = "active"
    user_sessions[session_id]["timestamp"] = time.time()

    # Broadcast the update
    background_tasks.add_task(dashboard_manager.broadcast_active_forms)
    background_tasks.add_task(form_manager.broadcast_form_update, form_id)

    return {"status": "success", "message": f"Session {session_id} is now active"}


# active_sessions: Dict[str, List[WebSocket]] = defaultdict(list)

class FocusConnectionManager:
    def __init__(self):
        self.connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, form_id: str):
        await websocket.accept()
        if form_id not in self.connections:
            self.connections[form_id] = []
        self.connections[form_id].append(websocket)

    def disconnect(self, websocket: WebSocket, form_id: str):
        if form_id in self.connections:
            self.connections[form_id].remove(websocket)
            if not self.connections[form_id]:
                del self.connections[form_id]

    async def broadcast(self, form_id: str, message: dict):
        if form_id in self.connections:
            for conn in self.connections[form_id]:
                try:
                    await conn.send_json(message)
                except Exception:
                    pass
                
focus_manager = FocusConnectionManager()

@app.websocket("/ws/form/{form_id}/focus")
async def focus_websocket(websocket: WebSocket, form_id: str, token: str = Query(None)):
    if token != ACCESS_TOKEN:
        await websocket.close(code=1008)
        return

    await focus_manager.connect(websocket, form_id)

    try:
        while True:
            data = await websocket.receive_json()
            user_id = data["user_id"]
            session_id = data["session_id"]
            main_section_id = data.get("main_section_id")
            sub_section_id = data.get("sub_section_id")
            field_id = data.get("field_id")

            # Update in-memory session data
            if form_id in active_form_sessions and user_id in active_form_sessions[form_id]:
                if session_id in active_form_sessions[form_id][user_id]:
                    active_form_sessions[form_id][user_id][session_id]["focus"] = {
                        "main_section_id": main_section_id,
                        "sub_section_id": sub_section_id,
                        "field_id": field_id
                    }

            # Broadcast to all monitors
            await focus_manager.broadcast(form_id, {
                "type": "focus_update",
                "user_id": user_id,
                "main_section_id": main_section_id,
                "sub_section_id": sub_section_id,
                "field_id": field_id
            })

    except WebSocketDisconnect:
        focus_manager.disconnect(websocket, form_id)