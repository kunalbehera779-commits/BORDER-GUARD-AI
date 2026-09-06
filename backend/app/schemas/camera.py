from __future__ import annotations

from pydantic import BaseModel, Field


class DetectionLabelSchema(BaseModel):
    type: str
    confidence: float
    trackId: str | None = None
    kind: str | None = None


class BoundingBoxSchema(BaseModel):
    id: str
    label: str
    confidence: float
    trackId: str | None = None
    kind: str | None = None
    top: str
    left: str
    width: str
    height: str


class CameraBase(BaseModel):
    id: str
    name: str
    sector: str = "Sector Alpha"
    status: str = "online"
    aiStatus: str = "active"
    scene: str = "gate"
    signalQuality: int = 100
    resolution: str = "1920×1080"
    fps: int = 25
    environment: str = "Daylight"
    currentEvent: str | None = None
    virtualFence: bool = False
    fenceBreached: bool = False
    detections: list[DetectionLabelSchema] = Field(default_factory=list)
    boxes: list[BoundingBoxSchema] = Field(default_factory=list)


class CameraCreate(CameraBase):
    pass


class CameraRead(CameraBase):
    pass
