from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List
import asyncio
import time
import os

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

# Data structure for active form sessions: { formId: { userId: timestamp } }
active_form_sessions: Dict[str, Dict[str, float]] = {}

# ================================
# Connection Managers
# ================================
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
        active_forms = [
            {
                "formId": form_id,
                "users": list(users.keys()),
                "activeUsers": len(users),
                "lastActive": max(users.values()),
            }
            for form_id, users in active_form_sessions.items() if users
        ]
        for connection in self.active_connections:
            try:
                await connection.send_json({"type": "active_forms_update", "data": active_forms})
            except Exception:
                pass


class FormConnectionManager:
    def __init__(self):
        # Each form can have multiple WebSocket connections (one per user)
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
        # Send active users for this specific form
        
        users = list(active_form_sessions.get(form_id, {}).keys())
        data = {
            "type": "form_users_update",
            "formId": form_id,
            "users": users,
            "activeUsers": len(users),
        }
        print(f"Broadcasting form update for form {data}")
        for connection in self.form_connections.get(form_id, []):
            try:
              
                await connection.send_json({"type": "form_update", "data": data})
            except Exception:
                pass


dashboard_manager = DashboardConnectionManager()
form_manager = FormConnectionManager()

# ================================
# Models
# ================================
class FormSession(BaseModel):
    form_id: str
    user_id: str

# ================================
# Background Task: Clean stale sessions
# ================================
async def cleanup_stale_sessions():
    while True:
        try:
            current_time = time.time()
            forms_updated = False

            for form_id, users in list(active_form_sessions.items()):
                for user_id, timestamp in list(users.items()):
                    if current_time - timestamp > 3:  # 3 sec timeout
                        active_form_sessions[form_id].pop(user_id)
                        forms_updated = True

                if not active_form_sessions[form_id]:
                    active_form_sessions.pop(form_id)
                    forms_updated = True

            if forms_updated:
                # Broadcast updates to both dashboard and relevant forms
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

# ================================
# WebSocket Endpoints
# ================================
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
        await websocket.close(code=1008)  # Policy Violation
        return
    await form_manager.connect(websocket, form_id)
    try:
        # Immediately send current active users for this form
        await form_manager.broadcast_form_update(form_id)
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        form_manager.disconnect(websocket, form_id)

# ================================
# API Endpoint to update activity
# ================================
@app.post("/api/form-activity")
async def update_form_activity(session: FormSession, background_tasks: BackgroundTasks, token: str = Query(None)):
    if token != ACCESS_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized") 

    form_id = session.form_id
    user_id = session.user_id

    if form_id not in active_form_sessions:
        active_form_sessions[form_id] = {}

    is_new_session = user_id not in active_form_sessions[form_id]
    active_form_sessions[form_id][user_id] = time.time()

    if is_new_session:
        background_tasks.add_task(dashboard_manager.broadcast_active_forms)
        background_tasks.add_task(form_manager.broadcast_form_update, form_id)

    return {"status": "success"}
