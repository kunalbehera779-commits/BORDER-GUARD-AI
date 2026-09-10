import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.event import AlertEvent
from app.schemas.event import AlertEventCreate, AlertEventUpdate, AlertEventResponse

router = APIRouter()

@router.get("/", response_model=List[AlertEventResponse])
def list_alerts(
    camera_id: Optional[str] = None,
    severity: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Retrieve list of threat alerts filtered by status, camera, or severity."""
    query = db.query(AlertEvent)
    if camera_id:
        query = query.filter(AlertEvent.camera_id == camera_id)
    if severity:
        query = query.filter(AlertEvent.severity == severity)
    if status_filter:
        query = query.filter(AlertEvent.status == status_filter)
        
    alerts = query.order_by(AlertEvent.timestamp.desc()).limit(limit).all()
    return alerts

@router.post("/", response_model=AlertEventResponse, status_code=status.HTTP_201_CREATED)
def create_alert(alert_in: AlertEventCreate, db: Session = Depends(get_db)):
    """Create a new alert event manually or via inference worker."""
    alert_id = alert_in.id or f"ALT-{uuid.uuid4().hex[:6].upper()}"
    alert = AlertEvent(
        id=alert_id,
        camera_id=alert_in.camera_id,
        camera_name=alert_in.camera_name,
        sector=alert_in.sector,
        title=alert_in.title,
        event_type=alert_in.event_type,
        severity=alert_in.severity,
        risk_score=alert_in.risk_score,
        status=alert_in.status,
        bbox=alert_in.bbox,
        track_id=alert_in.track_id,
        snapshot_url=alert_in.snapshot_url,
        details=alert_in.details
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert

@router.patch("/{alert_id}", response_model=AlertEventResponse)
def update_alert_status(alert_id: str, alert_in: AlertEventUpdate, db: Session = Depends(get_db)):
    """Update alert status (e.g. acknowledge or resolve alert)."""
    alert = db.query(AlertEvent).filter(AlertEvent.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    if alert_in.status:
        alert.status = alert_in.status
    if alert_in.severity:
        alert.severity = alert_in.severity
    if alert_in.details:
        alert.details = alert_in.details
        
    db.commit()
    db.refresh(alert)
    return alert
