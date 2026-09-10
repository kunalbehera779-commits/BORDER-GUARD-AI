import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey
from app.database import Base

class AlertEvent(Base):
    __tablename__ = "alert_events"

    id = Column(String, primary_key=True, index=True)
    camera_id = Column(String, ForeignKey("cameras.id"), nullable=False)
    camera_name = Column(String, nullable=False)
    sector = Column(String, nullable=False)
    title = Column(String, nullable=False)
    event_type = Column(String, nullable=False)
    severity = Column(String, nullable=False, default="medium") # low, medium, high, critical
    risk_score = Column(Float, nullable=False, default=50.0)
    status = Column(String, nullable=False, default="open") # open, acknowledged, resolved, dismissed
    bbox = Column(Text, nullable=True) # JSON list [x1, y1, x2, y2]
    track_id = Column(Integer, nullable=True)
    snapshot_url = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
