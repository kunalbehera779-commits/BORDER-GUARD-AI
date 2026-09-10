from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class DetectionEventBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    severity: str
    name: str
    cameraId: str = Field(validation_alias="camera_id", serialization_alias="cameraId")
    cameraName: str = Field(validation_alias="camera_name", serialization_alias="cameraName")
    timestamp: str
    confidence: float
    status: str
    detail: str | None = None
    zoneId: str | None = Field(default=None, validation_alias="zone_id", serialization_alias="zoneId")
    eventType: str | None = Field(default=None, validation_alias="event_type", serialization_alias="eventType")
    riskScore: float | None = Field(default=None, validation_alias="risk_score", serialization_alias="riskScore")
    environmentContext: str | None = Field(default=None, validation_alias="environment_context", serialization_alias="environmentContext")


class DetectionEventCreate(DetectionEventBase):
    pass


class DetectionEventRead(DetectionEventBase):
    pass
