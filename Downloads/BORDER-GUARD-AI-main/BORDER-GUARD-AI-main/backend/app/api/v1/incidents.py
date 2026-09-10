import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.incident import Incident
from app.schemas.incident import IncidentCreate, IncidentUpdate, IncidentResponse

router = APIRouter()

@router.get("/", response_model=List[IncidentResponse])
def list_incidents(
    status_filter: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """List recorded incident response tickets."""
    query = db.query(Incident)
    if status_filter:
        query = query.filter(Incident.status == status_filter)
    incidents = query.order_by(Incident.timestamp.desc()).limit(limit).all()
    return incidents

@router.post("/", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(inc_in: IncidentCreate, db: Session = Depends(get_db)):
    """Log a new border incident ticket."""
    inc_id = inc_in.id or f"INC-{uuid.uuid4().hex[:6].upper()}"
    incident = Incident(
        id=inc_id,
        title=inc_in.title,
        sector=inc_in.sector,
        camera_id=inc_in.camera_id,
        event_type=inc_in.event_type,
        severity=inc_in.severity,
        status=inc_in.status,
        assigned_team=inc_in.assigned_team,
        notes=inc_in.notes
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident

@router.patch("/{incident_id}", response_model=IncidentResponse)
def update_incident(incident_id: str, inc_in: IncidentUpdate, db: Session = Depends(get_db)):
    """Update status, team assignment, or notes of an incident."""
    incident = db.query(Incident).filter(Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    update_data = inc_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(incident, field, value)
        
    db.commit()
    db.refresh(incident)
    return incident
