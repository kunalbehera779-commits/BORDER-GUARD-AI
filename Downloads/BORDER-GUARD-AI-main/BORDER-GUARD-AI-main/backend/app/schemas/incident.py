from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class IncidentBase(BaseModel):
    title: str
    sector: str
    camera_id: Optional[str] = None
    event_type: str
    severity: str = "high"
    status: str = "in_progress" # in_progress, dispatched, investigating, resolved
    assigned_team: Optional[str] = "Alpha Rapid Response"
    notes: Optional[str] = None

class IncidentCreate(IncidentBase):
    id: Optional[str] = None

class IncidentUpdate(BaseModel):
    status: Optional[str] = None
    assigned_team: Optional[str] = None
    notes: Optional[str] = None

class IncidentResponse(IncidentBase):
    id: str
    timestamp: datetime

    class Config:
        from_attributes = True
