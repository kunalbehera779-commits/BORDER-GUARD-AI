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

    payload = event.model_dump()
    db_event = DetectionEvent(
        id=payload["id"], severity=payload["severity"], name=payload["name"],
        camera_id=payload["cameraId"], camera_name=payload["cameraName"], timestamp=payload["timestamp"],
        confidence=payload["confidence"], status=payload["status"], detail=payload.get("detail"),
        zone_id=payload.get("zoneId"), event_type=payload.get("eventType"), risk_score=payload.get("riskScore"),
        environment_context=payload.get("environmentContext"),
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event
