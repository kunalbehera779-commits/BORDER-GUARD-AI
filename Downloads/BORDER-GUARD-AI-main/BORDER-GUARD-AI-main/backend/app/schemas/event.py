from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class AlertEventBase(BaseModel):
    camera_id: str
    camera_name: str
    sector: str
    title: str
    event_type: str
    severity: str = "medium" # low, medium, high, critical
    risk_score: float = 50.0
    status: str = "open" # open, acknowledged, resolved, dismissed
    bbox: Optional[str] = None
    track_id: Optional[int] = None
    snapshot_url: Optional[str] = None
    details: Optional[str] = None

class AlertEventCreate(AlertEventBase):
    id: Optional[str] = None

class AlertEventUpdate(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    details: Optional[str] = None

class AlertEventResponse(AlertEventBase):
    id: str
    timestamp: datetime

    class Config:
        from_attributes = True
