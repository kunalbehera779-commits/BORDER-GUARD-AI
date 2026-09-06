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
    existing = db.query(Camera).filter(Camera.id == camera.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Camera already exists")

    db_camera = Camera(**camera.model_dump())
    db.add(db_camera)
    db.commit()
    db.refresh(db_camera)
    return db_camera
