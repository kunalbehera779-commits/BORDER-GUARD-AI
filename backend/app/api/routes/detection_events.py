from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.detection_event import DetectionEvent
from app.schemas.detection_event import DetectionEventCreate, DetectionEventRead

router = APIRouter(tags=["detection-events"])


@router.get("/detection-events", response_model=list[DetectionEventRead])
def list_detection_events(db: Session = Depends(get_db)):
    return db.query(DetectionEvent).all()


@router.get("/detection-events/{event_id}", response_model=DetectionEventRead)
def get_detection_event(event_id: str, db: Session = Depends(get_db)):
    event = db.query(DetectionEvent).filter(DetectionEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Detection event not found")
    return event


@router.post("/detection-events", response_model=DetectionEventRead, status_code=status.HTTP_201_CREATED)
def create_detection_event(event: DetectionEventCreate, db: Session = Depends(get_db)):
    existing = db.query(DetectionEvent).filter(DetectionEvent.id == event.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Detection event already exists")

    db_event = DetectionEvent(**event.model_dump(by_alias=True))
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event
