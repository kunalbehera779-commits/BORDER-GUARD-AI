from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class DetectionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    cameraId: str = Field(validation_alias="camera_id", serialization_alias="cameraId")
    className: str = Field(validation_alias="class_name", serialization_alias="className")
    confidence: float
    x1: int
    y1: int
    x2: int
    y2: int
    frameNumber: int | None = Field(default=None, validation_alias="frame_number", serialization_alias="frameNumber")
    timestampSeconds: float = Field(validation_alias="timestamp_seconds", serialization_alias="timestampSeconds")
    processingTimestamp: str = Field(validation_alias="processing_timestamp", serialization_alias="processingTimestamp")
    trackingId: str | None = Field(default=None, validation_alias="tracking_id", serialization_alias="trackingId")