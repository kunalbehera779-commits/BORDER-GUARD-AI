import asyncio
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.camera import Camera
from app.services.video_stream import stream_manager

router = APIRouter()

@router.websocket("/live/{camera_id}")
async def stream_live_video(websocket: WebSocket, camera_id: str):
    await websocket.accept()
    print(f"[WebSocket] Client connected to live stream of camera: {camera_id}")

    db = SessionLocal()
    try:
        camera = db.query(Camera).filter(Camera.id == camera_id).first()
        if not camera:
            camera_name = f"Camera {camera_id}"
            stream_url = "synthetic"
            stream_type = "synthetic"
            sector = "Sector Alpha"
            fence = None
        else:
            camera_name = camera.name
            stream_url = camera.stream_url
            stream_type = camera.stream_type
            sector = camera.sector
            fence = camera.virtual_fence
    finally:
        db.close()

    worker = stream_manager.get_or_create_worker(
        camera_id=camera_id,
        name=camera_name,
        stream_url=stream_url,
        stream_type=stream_type,
        sector=sector,
        virtual_fence=fence
    )

    try:
        while True:
            jpeg_bytes, base64_str, metadata = worker.get_latest_frame()
            if base64_str:
                payload = {
                    "frame": f"data:image/jpeg;base64,{base64_str}",
                    "meta": metadata
                }
                await websocket.send_json(payload)
            await asyncio.sleep(0.04) # ~25 FPS
    except WebSocketDisconnect:
        print(f"[WebSocket] Client disconnected from camera stream: {camera_id}")
    except Exception as e:
        print(f"[WebSocket] Live stream exception for camera {camera_id}: {e}")
