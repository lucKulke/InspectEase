from fastapi import FastAPI, WebSocket, WebSocketDisconnect, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Set, Optional
import asyncio
import time
from datetime import datetime

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data structure to store active form sessions
# { formId: { userId: timestamp } }
active_form_sessions: Dict[str, Dict[str, float]] = {}

# WebSocket connections manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast_active_forms(self):
        # Format data for the frontend
        active_forms = []
        for form_id, users in active_form_sessions.items():
            if users:  # Only include forms with active users
                active_forms.append({
                    "formId": form_id,
                    "activeUsers": len(users),
                    "lastActive": max(users.values())
                })
        
        # Send to all connected clients
        for connection in self.active_connections:
            try:
                await connection.send_json({
                    "type": "active_forms_update",
                    "data": active_forms
                })
            except Exception:
                # Handle potential disconnection errors
                pass

manager = ConnectionManager()

# Models
class FormSession(BaseModel):
    form_id: str
    user_id: str

# Background task to clean up stale sessions
async def cleanup_stale_sessions():
    while True:
        try:
            current_time = time.time()
            forms_updated = False
            
            # Check each form
            for form_id, users in list(active_form_sessions.items()):
                # Check each user in the form
                for user_id, timestamp in list(users.items()):
                    # If the session is stale (older than 5 seconds)
                    if current_time - timestamp > 5:
                        active_form_sessions[form_id].pop(user_id)
                        forms_updated = True
                
                # If no users are editing this form, remove the form entry
                if not active_form_sessions[form_id]:
                    active_form_sessions.pop(form_id)
                    forms_updated = True
            
            # If we removed any sessions, broadcast the update
            if forms_updated:
                await manager.broadcast_active_forms()
                
            await asyncio.sleep(1)  # Check every second
        except Exception as e:
            print(f"Error in cleanup task: {e}")
            await asyncio.sleep(1)

# Start background task when app starts
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(cleanup_stale_sessions())

# WebSocket endpoint for dashboards
@app.websocket("/ws/dashboard")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial active forms data
        await manager.broadcast_active_forms()
        
        # Keep the connection alive
        while True:
            # Wait for any message (like ping)
            data = await websocket.receive_text()
            # Could handle specific commands here if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# API endpoint to register/update form activity
@app.post("/api/form-activity")
async def update_form_activity(session: FormSession, background_tasks: BackgroundTasks):
    form_id = session.form_id
    user_id = session.user_id
    
    # Initialize form entry if it doesn't exist
    if form_id not in active_form_sessions:
        active_form_sessions[form_id] = {}
    
    # Check if this is a new session for this form
    is_new_session = user_id not in active_form_sessions[form_id]
    
    # Update timestamp
    active_form_sessions[form_id][user_id] = time.time()
    
    # If it's a new session, broadcast update
    if is_new_session:
        background_tasks.add_task(manager.broadcast_active_forms)
    
    return {"status": "success"}