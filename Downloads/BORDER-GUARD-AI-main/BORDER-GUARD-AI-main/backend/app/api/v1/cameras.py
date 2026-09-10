import os
import cv2
import uuid
import shutil
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models.camera import Camera
from app.schemas.camera import (
    CameraCreate, CameraUpdate, CameraResponse,
    CameraTestConnectionRequest, CameraTestConnectionResponse
)
from app.services.video_stream import stream_manager

router = APIRouter()

@router.post("/upload-video")
async def upload_video_file(file: UploadFile = File(...)):
    """
    Upload a local MP4/AVI video file for live AI surveillance scanning.
    """
    filename_str = file.filename or "video.mp4"
    if not filename_str.lower().endswith(('.mp4', '.avi', '.mkv', '.mov', '.webm')):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload an MP4, AVI, MOV, or MKV video file.")

    upload_dir = settings.STORAGE_PATH / "uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)

    safe_name = filename_str.replace(' ', '_').replace('"', '').replace("'", "")
    filename = f"vid_{uuid.uuid4().hex[:6]}_{safe_name}"
    file_path = upload_dir / filename

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        norm_path = str(file_path).replace("\\", "/")
        return {
            "success": True,
            "filename": filename_str,
            "file_path": norm_path,
            "message": "Video file uploaded successfully!"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded video file: {str(e)}")

@router.post("/test-connection", response_model=CameraTestConnectionResponse)
def test_camera_connection(req: CameraTestConnectionRequest):
    """
    Test reachability of any CCTV camera endpoint (RTSP URL, HTTP MJPEG, Webcam index 0/1, MP4 file).
    """
    source = (req.stream_url or "").strip().replace('"', '').replace("'", "")
    
    if not source:
        return CameraTestConnectionResponse(
            success=False,
            message="Stream URL or file path is required."
        )

    # Check if stream source is numeric webcam index
    if source.isdigit():
        source_arg = int(source)
        cap = cv2.VideoCapture(source_arg, cv2.CAP_DSHOW)
        if not cap.isOpened():
            cap = cv2.VideoCapture(source_arg, cv2.CAP_MSMF)
        if not cap.isOpened():
            cap = cv2.VideoCapture(source_arg)
    else:
        norm_source = os.path.normpath(source) if os.path.exists(source) else source
        cap = cv2.VideoCapture(norm_source)

    try:
        if not cap.isOpened():
            return CameraTestConnectionResponse(
                success=False,
                message=f"Failed to open video stream source. Make sure file path or RTSP URL is valid."
            )
        
        ret, frame = cap.read()
        if not ret or frame is None:
            cap.release()
            return CameraTestConnectionResponse(
                success=False,
                message="Connected to stream, but failed to read initial frame."
            )
        
        height, width = frame.shape[:2]
        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        cap.release()
        
        return CameraTestConnectionResponse(
            success=True,
            message="Connection successful! Stream is active.",
            frame_width=width,
            frame_height=height,
            fps=fps
        )
    except Exception as e:
        return CameraTestConnectionResponse(
            success=False,
            message=f"Stream error: {str(e)}"
        )

@router.get("/", response_model=List[CameraResponse])
def list_cameras(db: Session = Depends(get_db)):
    """List all registered CCTV cameras."""
    cameras = db.query(Camera).filter(Camera.is_active == True).all()
    return cameras

@router.post("/", response_model=CameraResponse, status_code=status.HTTP_201_CREATED)
def create_camera(camera_in: CameraCreate, db: Session = Depends(get_db)):
    """Register/connect a new camera feed."""
    camera_id = camera_in.id or f"CAM-{uuid.uuid4().hex[:4].upper()}"
    clean_url = (camera_in.stream_url or "").strip().replace('"', '').replace("'", "")
    
    # Check duplicate
    existing = db.query(Camera).filter(Camera.id == camera_id).first()
    if existing:
        # Update existing record
        existing.name = camera_in.name
        existing.stream_url = clean_url
        existing.stream_type = camera_in.stream_type
        existing.sector = camera_in.sector
        existing.status = camera_in.status
        existing.is_active = True
        db.commit()
        db.refresh(existing)
        camera = existing
    else:
        camera = Camera(
            id=camera_id,
            name=camera_in.name,
            stream_url=clean_url,
            stream_type=camera_in.stream_type,
            sector=camera_in.sector,
            status=camera_in.status,
            ai_status=camera_in.ai_status,
            fps=camera_in.fps,
            resolution=camera_in.resolution,
            virtual_fence=camera_in.virtual_fence
        )
        db.add(camera)
        db.commit()
        db.refresh(camera)
    
    # Pre-warm background video worker thread
    stream_manager.get_or_create_worker(
        camera_id=camera.id,
        name=camera.name,
        stream_url=camera.stream_url,
        stream_type=camera.stream_type,
        sector=camera.sector,
        virtual_fence=camera.virtual_fence
    )
    
    return camera

@router.get("/{camera_id}", response_model=CameraResponse)
def get_camera(camera_id: str, db: Session = Depends(get_db)):
    """Get single camera details."""
    camera = db.query(Camera).filter(Camera.id == camera_id, Camera.is_active == True).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return camera

@router.put("/{camera_id}", response_model=CameraResponse)
def update_camera(camera_id: str, camera_in: CameraUpdate, db: Session = Depends(get_db)):
    """Update camera details or virtual fence parameters."""
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    update_data = camera_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(camera, field, value)
    
    db.commit()
    db.refresh(camera)
    return camera

@router.delete("/{camera_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_camera(camera_id: str, db: Session = Depends(get_db)):
    """Delete a camera feed and terminate its background worker thread."""
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if camera:
        db.delete(camera)
        db.commit()
    stream_manager.stop_worker(camera_id)
    return None
