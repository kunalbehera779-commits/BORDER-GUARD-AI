from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class AlertBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    severity: str
    cameraId: str = Field(validation_alias="camera_id", serialization_alias="cameraId")
    cameraName: str = Field(validation_alias="camera_name", serialization_alias="cameraName")
    timestamp: str
    status: str
    details: str | None = None
    eventId: str | None = Field(default=None, validation_alias="event_id", serialization_alias="eventId")
    zoneId: str | None = Field(default=None, validation_alias="zone_id", serialization_alias="zoneId")
    riskScore: float | None = Field(default=None, validation_alias="risk_score", serialization_alias="riskScore")


class AlertCreate(AlertBase):
    pass


class AlertRead(AlertBase):
    pass
