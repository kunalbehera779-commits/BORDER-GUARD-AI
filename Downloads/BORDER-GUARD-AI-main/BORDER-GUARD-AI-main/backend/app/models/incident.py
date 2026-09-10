import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from app.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    sector = Column(String, nullable=False)
    camera_id = Column(String, ForeignKey("cameras.id"), nullable=True)
    event_type = Column(String, nullable=False)
    severity = Column(String, nullable=False, default="high")
    status = Column(String, nullable=False, default="in_progress") # in_progress, dispatched, investigating, resolved
    assigned_team = Column(String, nullable=True, default="Alpha Rapid Response")
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
