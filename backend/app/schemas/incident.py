from __future__ import annotations

from pydantic import BaseModel


class IncidentBase(BaseModel):
    id: str
    eventType: str
    cameraId: str
    cameraName: str
    severity: str
    timestamp: str
    status: str


class IncidentCreate(IncidentBase):
    pass


class IncidentRead(IncidentBase):
    pass
