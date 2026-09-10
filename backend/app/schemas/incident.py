from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class IncidentBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    eventType: str
    cameraId: str
    cameraName: str
    severity: str
    timestamp: str
    status: str
    details: str | None = None
    eventId: str | None = Field(default=None, validation_alias="event_id", serialization_alias="eventId")
    objectType: str | None = Field(default=None, validation_alias="object_type", serialization_alias="objectType")
    trackingId: str | None = Field(default=None, validation_alias="tracking_id", serialization_alias="trackingId")
    confidence: float | None = None
    evidencePath: str | None = Field(default=None, validation_alias="evidence_path", serialization_alias="evidencePath")
    operatorNotes: str | None = Field(default=None, validation_alias="operator_notes", serialization_alias="operatorNotes")


class IncidentCreate(IncidentBase):
    pass


class IncidentRead(IncidentBase):
    pass
