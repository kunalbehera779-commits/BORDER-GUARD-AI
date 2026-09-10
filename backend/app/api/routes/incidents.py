from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.incident import Incident
from app.schemas.incident import IncidentCreate, IncidentRead

router = APIRouter(tags=["incidents"])


@router.get("/incidents", response_model=list[IncidentRead])
def list_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).all()


@router.get("/incidents/{incident_id}", response_model=IncidentRead)
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    return incident


@router.post("/incidents", response_model=IncidentRead, status_code=status.HTTP_201_CREATED)
def create_incident(incident: IncidentCreate, db: Session = Depends(get_db)):
    existing = db.query(Incident).filter(Incident.id == incident.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incident already exists")

    payload = incident.model_dump()
    db_incident = Incident(
        id=payload["id"], event_type=payload["eventType"], camera_id=payload["cameraId"],
        camera_name=payload["cameraName"], severity=payload["severity"], timestamp=payload["timestamp"],
        status=payload["status"], details=payload.get("details"), event_id=payload.get("eventId"),
        object_type=payload.get("objectType"), tracking_id=payload.get("trackingId"),
        confidence=payload.get("confidence"), evidence_path=payload.get("evidencePath"),
        operator_notes=payload.get("operatorNotes"),
    )
    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    return db_incident
