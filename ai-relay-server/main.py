# relay_server.py
from fastapi import FastAPI, WebSocket, Request, WebSocketDisconnect
import httpx
import asyncio
import websockets
import os

app = FastAPI()

# Local server behind Tailscale (replace with your actual IP)
LOCAL_SERVER = os.getenv("LOCAL_AI_SERVER")
print(LOCAL_SERVER, flush=True)

@app.post("/transcribe")
async def relay_post_transcribe(request: Request):
    body = await request.body()

    async with httpx.AsyncClient() as client:
        response = await client.post(f"http://{LOCAL_SERVER}/transcribe", content=body, headers=request.headers)
    return response.json()


@app.websocket("/ws/transcribe")
async def relay_ws_transcribe(websocket: WebSocket):
    await websocket.accept()

    uri = f"ws://{LOCAL_SERVER}/ws/transcribe"

    try:
        async with websockets.connect(uri) as local_ws:

            async def forward_to_local():
                while True:
                    data = await websocket.receive_bytes()
                    await local_ws.send(data)

            async def forward_to_client():
                while True:
                    data = await local_ws.recv()
                    await websocket.send_text(data)

            await asyncio.gather(forward_to_local(), forward_to_client())

    except WebSocketDisconnect:
        print("Client disconnected.")
    except Exception as e:
        print(f"Relay error: {e}")
        await websocket.close()
