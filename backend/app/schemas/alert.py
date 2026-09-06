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


class AlertCreate(AlertBase):
    pass


class AlertRead(AlertBase):
    pass
