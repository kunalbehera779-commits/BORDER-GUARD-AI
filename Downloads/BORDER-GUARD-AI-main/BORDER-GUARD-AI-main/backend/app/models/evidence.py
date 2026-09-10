import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from app.database import Base

class EvidenceItem(Base):
    __tablename__ = "evidence_items"

    id = Column(String, primary_key=True, index=True)
    alert_id = Column(String, ForeignKey("alert_events.id"), nullable=True)
    camera_id = Column(String, ForeignKey("cameras.id"), nullable=False)
    title = Column(String, nullable=False)
    media_type = Column(String, nullable=False) # snapshot, clip
    file_path = Column(String, nullable=False)
    file_size_bytes = Column(Integer, default=0)
    hash_sha256 = Column(String, nullable=True) # Integrity verification hash
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
