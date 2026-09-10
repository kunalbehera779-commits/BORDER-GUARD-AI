from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.camera import Camera
from app.schemas.camera import CameraCreate, CameraRead

router = APIRouter(tags=["cameras"])


@router.get("/cameras", response_model=list[CameraRead])
def list_cameras(db: Session = Depends(get_db)):
    return db.query(Camera).all()


@router.get("/cameras/{camera_id}", response_model=CameraRead)
def get_camera(camera_id: str, db: Session = Depends(get_db)):
    camera = db.query(Camera).filter(Camera.id == camera_id).first()
    if not camera:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera not found")
    return camera


@router.post("/cameras", response_model=CameraRead, status_code=status.HTTP_201_CREATED)
def create_camera(camera: CameraCreate, db: Session = Depends(get_db)):
    payload = camera.model_dump()
    existing = db.query(Camera).filter(Camera.id == camera.id).first()

    if existing:
        for key, value in payload.items():
            if key == "id":
                continue
            setattr(existing, key.replace("aiStatus", "ai_status").replace("signalQuality", "signal_quality").replace("currentEvent", "current_event").replace("virtualFence", "virtual_fence").replace("fenceBreached", "fence_breached"), value)
        db.commit()
        db.refresh(existing)
        return existing

    db_camera = Camera(
        id=payload["id"], name=payload["name"], sector=payload["sector"], status=payload["status"],
        ai_status=payload["aiStatus"], scene=payload["scene"], signal_quality=payload["signalQuality"],
        resolution=payload["resolution"], fps=payload["fps"], environment=payload["environment"],
        current_event=payload["currentEvent"], virtual_fence=payload["virtualFence"],
        fence_breached=payload["fenceBreached"],
    )
    db.add(db_camera)
    db.commit()
    db.refresh(db_camera)
    return db_camera
