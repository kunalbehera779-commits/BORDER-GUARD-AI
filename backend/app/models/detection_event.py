from __future__ import annotations

from sqlalchemy import Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class DetectionEvent(Base):
    __tablename__ = "detection_events"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    severity: Mapped[str] = mapped_column(String(50), nullable=False, default="medium")
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    camera_id: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    camera_name: Mapped[str] = mapped_column(String(200), nullable=False)
    timestamp: Mapped[str] = mapped_column(String(100), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="open")
    detail: Mapped[str | None] = mapped_column(Text, nullable=True)
    track_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    detection_kind: Mapped[str | None] = mapped_column(String(50), nullable=True)
    event_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
