from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
import asyncio
import time
import os
import json
import redis.asyncio as redis


import dotenv
dotenv.load_dotenv()

app = FastAPI()

ACCESS_TOKEN = os.getenv("ACCESS_TOKEN")
REDIS_URL = os.getenv("REDIS_URL")

# Redis connection
redis_client: Optional[redis.Redis] = None

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================================
# Redis Helper Functions
# ======================================
class RedisSessionManager:
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        self.form_sessions_key = "active_form_sessions"
        self.session_timeout = 6  # seconds

    async def get_all_form_sessions(self) -> Dict:
        """Get all form sessions from Redis"""
        try:
            data = await self.redis.hgetall(self.form_sessions_key)
            if not data:
                return {}
            
            result = {}
            for form_id, sessions_json in data.items():
                form_id = form_id.decode() if isinstance(form_id, bytes) else form_id
                sessions_data = json.loads(sessions_json.decode() if isinstance(sessions_json, bytes) else sessions_json)
                result[form_id] = sessions_data
            return result
        except Exception as e:
            print(f"Error getting form sessions: {e}")
            return {}

    async def get_form_sessions(self, form_id: str) -> Dict:
        """Get sessions for a specific form"""
        try:
            sessions_json = await self.redis.hget(self.form_sessions_key, form_id)
            if not sessions_json:
                return {}
            
            sessions_data = json.loads(sessions_json.decode() if isinstance(sessions_json, bytes) else sessions_json)
            return sessions_data
        except Exception as e:
            print(f"Error getting sessions for form {form_id}: {e}")
            return {}

    async def set_form_sessions(self, form_id: str, sessions: Dict):
        """Set sessions for a specific form"""
        try:
            sessions_json = json.dumps(sessions)
            await self.redis.hset(self.form_sessions_key, form_id, sessions_json)
        except Exception as e:
            print(f"Error setting sessions for form {form_id}: {e}")

    async def delete_form_sessions(self, form_id: str):
        """Delete sessions for a specific form"""
        try:
            await self.redis.hdel(self.form_sessions_key, form_id)
        except Exception as e:
            print(f"Error deleting sessions for form {form_id}: {e}")

    async def update_session(self, form_id: str, user_id: str, session_id: str, role: str = None, focus_data: Dict = None, color: str = None):
        """Update a specific session"""
        try:
            sessions = await self.get_form_sessions(form_id)
            
            if user_id not in sessions:
                sessions[user_id] = {}
            
            if session_id not in sessions[user_id]:
                sessions[user_id][session_id] = {}
            
            # Update timestamp
            sessions[user_id][session_id]["timestamp"] = time.time()
            
            # Update role if provided
            if role is not None:
                sessions[user_id][session_id]["role"] = role
            
            # Update focus data if provided
            if focus_data is not None:
                sessions[user_id][session_id]["focus"] = focus_data
            
            # Update color if provided
            if color is not None:
                sessions[user_id][session_id]["color"] = color
            
            await self.set_form_sessions(form_id, sessions)
            return sessions[user_id][session_id]
        except Exception as e:
            print(f"Error updating session: {e}")
            return None

    async def update_user_color(self, form_id: str, user_id: str, color: str):
        """Update color for all sessions of a user"""
        try:
            sessions = await self.get_form_sessions(form_id)
            
            if user_id in sessions:
                # Update color for all user sessions
                for session_id in sessions[user_id]:
                    sessions[user_id][session_id]["color"] = color
                    sessions[user_id][session_id]["timestamp"] = time.time()
                
                await self.set_form_sessions(form_id, sessions)
                return True
            return False
        except Exception as e:
            print(f"Error updating user color: {e}")
            return False

    async def cleanup_stale_sessions(self):
        """Remove sessions that have timed out"""
        try:
            current_time = time.time()
            all_sessions = await self.get_all_form_sessions()
            forms_updated = False

            for form_id, users in list(all_sessions.items()):
                for user_id, sessions in list(users.items()):
                    for session_id, data in list(sessions.items()):
                        if current_time - data.get("timestamp", 0) > self.session_timeout:
                            users[user_id].pop(session_id, None)
                            forms_updated = True

                    # If no sessions remain for this user
                    if not users[user_id]:
                        users.pop(user_id, None)
                        forms_updated = True
                    else:
                        # Ensure at least one session is active
                        if not any(s.get("role") == "active" for s in users[user_id].values()):
                            for sid in users[user_id]:
                                users[user_id][sid]["role"] = "active"
                                break

                if not users:
                    await self.delete_form_sessions(form_id)
                    forms_updated = True
                else:
                    await self.set_form_sessions(form_id, users)

            return forms_updated
        except Exception as e:
            print(f"Error during cleanup: {e}")
            return False

# Global session manager
session_manager: Optional[RedisSessionManager] = None

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
        if not session_manager:
            return
            
        all_sessions = await session_manager.get_all_form_sessions()
        active_forms = []
        
        for form_id, users in all_sessions.items():
            if not users:
                continue

            all_timestamps = [
                s.get("timestamp", 0) for sessions in users.values() for s in sessions.values()
            ]
            active_forms.append({
                "formId": form_id,
                "users": list(users.keys()),
                "activeUsers": len(users),
                "lastActive": max(all_timestamps) if all_timestamps else None
            })

        # Create a copy of connections to avoid modification during iteration
        connections_copy = self.active_connections.copy()
        for connection in connections_copy:
            try:
                await connection.send_json({"type": "active_forms_update", "data": active_forms})
            except Exception as e:
                print(f"Error broadcasting to dashboard connection: {e}")
                # Remove the failed connection
                self.disconnect(connection)


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
        if not session_manager:
            return
            
        sessions = await session_manager.get_form_sessions(form_id)
        if not sessions:
            return

        users = {
            user_id: {
                "sessions": {sid: s.get("role", "monitor") for sid, s in user_sessions.items()}
            }
            for user_id, user_sessions in sessions.items()
        }

        data = {
            "type": "form_users_update",
            "formId": form_id,
            "users": users,
            "activeUsers": len(users),
        }

        # Create a copy of connections to avoid modification during iteration
        connections = self.form_connections.get(form_id, []).copy()
        for connection in connections:
            try:
                await connection.send_json({"type": "form_update", "data": data})
            except Exception as e:
                print(f"Error broadcasting to form connection: {e}")
                # Remove the failed connection
                self.disconnect(connection, form_id)


class ColorConnectionManager:
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

    async def broadcast_color_change(self, form_id: str, user_id: str, color: str):
        if form_id in self.connections:
            # Create a copy of connections to avoid modification during iteration
            connections = self.connections[form_id].copy()
            for conn in connections:
                try:
                    await conn.send_json({
                        "type": "color_change",
                        "user_id": user_id,
                        "color": color
                    })
                except Exception as e:
                    print(f"Error broadcasting color change: {e}")
                    # Remove the failed connection
                    self.disconnect(conn, form_id)


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
            # Create a copy of connections to avoid modification during iteration
            connections = self.connections[form_id].copy()
            for conn in connections:
                try:
                    await conn.send_json(message)
                except Exception as e:
                    print(f"Error broadcasting focus update: {e}")
                    # Remove the failed connection
                    self.disconnect(conn, form_id)


dashboard_manager = DashboardConnectionManager()
form_manager = FormConnectionManager()
focus_manager = FocusConnectionManager()
color_manager = ColorConnectionManager()

# ======================================
# Models
# ======================================
class FormSession(BaseModel):
    form_id: str
    user_id: str
    session_id: str
    takeover: bool = False


class TakeoverRequest(BaseModel):
    form_id: str
    user_id: str
    session_id: str


class ColorChangeRequest(BaseModel):
    form_id: str
    user_id: str
    color: str


# ======================================
# Background Task: Clean stale sessions
# ======================================
async def cleanup_stale_sessions():
    while True:
        try:
            if session_manager:
                forms_updated = await session_manager.cleanup_stale_sessions()
                
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
    global redis_client, session_manager
    
    # Initialize Redis connection
    try:
        redis_client = redis.from_url(REDIS_URL, decode_responses=False)
        await redis_client.ping()
        session_manager = RedisSessionManager(redis_client)
        print("Connected to Redis successfully")
    except Exception as e:
        print(f"Failed to connect to Redis: {e}")
        raise
    
    # Start cleanup task
    asyncio.create_task(cleanup_stale_sessions())


@app.on_event("shutdown")
async def shutdown_event():
    global redis_client
    if redis_client:
        await redis_client.close()


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
            try:
                await websocket.receive_text()
            except WebSocketDisconnect:
                break
            except Exception as e:
                print(f"Dashboard WebSocket error: {e}")
                break
    except Exception as e:
        print(f"Dashboard WebSocket connection error: {e}")
    finally:
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
            try:
                await websocket.receive_text()
            except WebSocketDisconnect:
                break
            except Exception as e:
                print(f"Form WebSocket error: {e}")
                break
    except Exception as e:
        print(f"Form WebSocket connection error: {e}")
    finally:
        form_manager.disconnect(websocket, form_id)


@app.websocket("/ws/form/{form_id}/color")
async def color_websocket(websocket: WebSocket, form_id: str, token: str = Query(None)):
    if token != ACCESS_TOKEN:
        await websocket.close(code=1008)
        return

    await color_manager.connect(websocket, form_id)

    try:
        while True:
            try:
                # Just keep the connection alive - we only broadcast, don't receive
                await websocket.receive_text()
            except WebSocketDisconnect:
                break
            except Exception as e:
                print(f"Color WebSocket error: {e}")
                break
    except Exception as e:
        print(f"Color WebSocket connection error: {e}")
    finally:
        color_manager.disconnect(websocket, form_id)


# ======================================
# API Endpoints
# ======================================
@app.post("/api/form-activity")
async def update_form_activity(session: FormSession, background_tasks: BackgroundTasks, token: str = Query(None)):
    if token != ACCESS_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    if not session_manager:
        raise HTTPException(status_code=500, detail="Session manager not initialized")

    form_id, user_id, session_id = session.form_id, session.user_id, session.session_id

    # Get current form sessions
    form_sessions = await session_manager.get_form_sessions(form_id)
    
    # Check if user already has sessions
    user_sessions = form_sessions.get(user_id, {})
    
    # Determine role for new session
    if session_id in user_sessions:
        # Existing session - keep current role, just update timestamp
        current_role = user_sessions[session_id].get("role", "monitor")
    else:
        # New session - assign role based on existing sessions
        has_active = any(s.get("role") == "active" for s in user_sessions.values())
        current_role = "monitor" if has_active else "active"

    # Update session in Redis
    updated_session = await session_manager.update_session(form_id, user_id, session_id, role=current_role)
    
    if not updated_session:
        raise HTTPException(status_code=500, detail="Failed to update session")

    # Broadcast updates
    background_tasks.add_task(dashboard_manager.broadcast_active_forms)
    background_tasks.add_task(form_manager.broadcast_form_update, form_id)

    return {"status": "success", "role": current_role}


@app.websocket("/ws/form/{form_id}/focus")
async def focus_websocket(websocket: WebSocket, form_id: str, token: str = Query(None)):
    if token != ACCESS_TOKEN:
        await websocket.close(code=1008)
        return

    await focus_manager.connect(websocket, form_id)

    try:
        while True:
            try:
                data = await websocket.receive_json()
                user_id = data["user_id"]
                session_id = data["session_id"]
                main_section_id = data.get("main_section_id")
                sub_section_id = data.get("sub_section_id")
                field_id = data.get("field_id")

                # Update focus in Redis
                focus_data = {
                    "main_section_id": main_section_id,
                    "sub_section_id": sub_section_id,
                    "field_id": field_id
                }
                
                if session_manager:
                    await session_manager.update_session(form_id, user_id, session_id, focus_data=focus_data)

                # Broadcast to all monitors
                await focus_manager.broadcast(form_id, {
                    "type": "focus_update",
                    "user_id": user_id,
                    "main_section_id": main_section_id,
                    "sub_section_id": sub_section_id,
                    "field_id": field_id
                })
            except WebSocketDisconnect:
                break
            except Exception as e:
                print(f"Focus WebSocket error: {e}")
                break
    except Exception as e:
        print(f"Focus WebSocket connection error: {e}")
    finally:
        focus_manager.disconnect(websocket, form_id)


@app.post("/api/user-color")
async def update_user_color(req: ColorChangeRequest, background_tasks: BackgroundTasks, token: str = Query(None)):
    if token != ACCESS_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    if not session_manager:
        raise HTTPException(status_code=500, detail="Session manager not initialized")

    form_id, user_id, color = req.form_id, req.user_id, req.color

    # Update user color in Redis
    success = await session_manager.update_user_color(form_id, user_id, color)
    
    if not success:
        raise HTTPException(status_code=404, detail="User not found in form sessions")

    # Broadcast color change to all color listeners
    await color_manager.broadcast_color_change(form_id, user_id, color)

@app.post("/api/takeover")
async def takeover_session(req: TakeoverRequest, background_tasks: BackgroundTasks, token: str = Query(None)):
    if token != ACCESS_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    if not session_manager:
        raise HTTPException(status_code=500, detail="Session manager not initialized")

    form_id, user_id, session_id = req.form_id, req.user_id, req.session_id

    # Get current form sessions
    form_sessions = await session_manager.get_form_sessions(form_id)
    
    if user_id not in form_sessions or session_id not in form_sessions[user_id]:
        raise HTTPException(status_code=404, detail="Session not found")

    # Set all user sessions to monitor
    for sid in form_sessions[user_id]:
        form_sessions[user_id][sid]["role"] = "monitor"
    
    # Set requested session as active
    form_sessions[user_id][session_id]["role"] = "active"
    form_sessions[user_id][session_id]["timestamp"] = time.time()
    
    # Save updated sessions
    await session_manager.set_form_sessions(form_id, form_sessions)

    # Broadcast updates
    background_tasks.add_task(dashboard_manager.broadcast_active_forms)
    background_tasks.add_task(form_manager.broadcast_form_update, form_id)

    return {"status": "success", "message": f"Session {session_id} is now active"}