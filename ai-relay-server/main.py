# relay_server.py
from fastapi import FastAPI, WebSocket, Request, WebSocketDisconnect
import httpx
import asyncio
import websockets
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from deepgram import DeepgramClient, LiveOptions, LiveTranscriptionEvents
from dotenv import load_dotenv
load_dotenv()

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


DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
dg_client = DeepgramClient(DEEPGRAM_API_KEY)

@app.websocket("/ws/deepgram")
async def websocket_deepgram(websocket: WebSocket):
    await websocket.accept()
    connection = None
    ready = asyncio.Event()

    try:
        # Correctly create a connection using the new SDK structure
        connection = dg_client.listen.websocket.v("1")
        def handle_transcript(result):
            print(result, flush=True)
        # def on_open(event):
        #     print("Deepgram WebSocket opened", flush=True)
        #     ready.set()
        # Handle transcription events
        connection.on(LiveTranscriptionEvents.Transcript, handle_transcript)
        # connection.on(LiveTranscriptionEvents.Open, on_open)

        # Start connection with streaming options
        connection.start(LiveOptions(model="nova-3", language="en-US"))
        
        # Handle transcription events# Define handler functions
        # async def on_transcript(result):
        #     transcript = result.channel.alternatives[0].transcript
        #     if transcript:
        #         await websocket.send_text(transcript)

        # async def on_open(event):
        #     print("Deepgram connection opened")

        # async def on_error(error):
        #     print("Deepgram error:", error)

        # # Register event handlers properly (NOT decorators)
        # connection.on(LiveTranscriptionEvents.Transcript, on_transcript)
        # connection.on(LiveTranscriptionEvents.Open, on_open)
        # connection.on(LiveTranscriptionEvents.Error, on_error)

        # # Start Deepgram connection
        # await connection.start(
        #     LiveOptions(
        #         model="nova-3",
        #         language="en-US",
        #         smart_format=True,
        #         interim_results=False
        #     )
        # )

        # Forward audio to Deepgram
        
        while True:
            
            data = await websocket.receive_bytes()
            # print(data, flush=True)
            connection.send(data)

    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        if connection:
             connection.finish()
        await websocket.close()

