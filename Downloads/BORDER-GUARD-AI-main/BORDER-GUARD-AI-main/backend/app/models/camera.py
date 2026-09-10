import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, Boolean
from app.database import Base

class Camera(Base):
    __tablename__ = "cameras"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    stream_url = Column(String, nullable=False, default="0")
    stream_type = Column(String, nullable=False, default="webcam") # rtsp, mjpeg, webcam, file, synthetic
    sector = Column(String, nullable=False, default="Sector Alpha")
    status = Column(String, nullable=False, default="online") # online, offline, degraded
    ai_status = Column(String, nullable=False, default="active") # active, bypassed, error
    fps = Column(Integer, default=25)
    latency_ms = Column(Integer, default=18)
    resolution = Column(String, default="1080p")
    virtual_fence = Column(Text, nullable=True) # JSON string of polygon coordinates & tripwires
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
