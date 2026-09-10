from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class CameraBase(BaseModel):
    name: str = Field(..., example="Alpha Gate North")
    stream_url: str = Field(..., example="rtsp://192.168.1.100:554/live")
    stream_type: str = Field(default="rtsp", example="rtsp") # rtsp, mjpeg, webcam, file, synthetic
    sector: str = Field(default="Sector Alpha", example="Sector Alpha")
    status: str = Field(default="online", example="online")
    ai_status: str = Field(default="active", example="active")
    fps: int = Field(default=25)
    resolution: str = Field(default="1080p")
    virtual_fence: Optional[str] = None # JSON string of points

class CameraCreate(CameraBase):
    id: Optional[str] = None # Auto generated if not provided

class CameraUpdate(BaseModel):
    name: Optional[str] = None
    stream_url: Optional[str] = None
    stream_type: Optional[str] = None
    sector: Optional[str] = None
    status: Optional[str] = None
    ai_status: Optional[str] = None
    fps: Optional[int] = None
    resolution: Optional[str] = None
    virtual_fence: Optional[str] = None
    is_active: Optional[bool] = None

class CameraResponse(CameraBase):
    id: str
    latency_ms: int = 18
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CameraTestConnectionRequest(BaseModel):
    stream_url: str
    stream_type: Optional[str] = "rtsp"

class CameraTestConnectionResponse(BaseModel):
    success: bool
    message: str
    frame_width: Optional[int] = None
    frame_height: Optional[int] = None
    fps: Optional[float] = None
