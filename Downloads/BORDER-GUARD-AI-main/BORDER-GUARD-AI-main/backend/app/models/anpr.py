import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey
from app.database import Base

class ANPRRecord(Base):
    __tablename__ = "anpr_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    camera_id = Column(String, ForeignKey("cameras.id"), nullable=False)
    plate_number = Column(String, index=True, nullable=False)
    vehicle_type = Column(String, default="car")
    confidence = Column(Integer, default=90)
    is_watchlist_match = Column(Boolean, default=False)
    watchlist_category = Column(String, nullable=True) # e.g. Blacklisted, Suspect, High-Risk
    snapshot_url = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
