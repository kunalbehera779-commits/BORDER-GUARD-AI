from __future__ import annotations

from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Detection(Base):
    __tablename__ = "detections"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    camera_id: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    class_name: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    confidence: Mapped[float] = mapped_column(Float, nullable=False)
    x1: Mapped[int] = mapped_column(Integer, nullable=False)
    y1: Mapped[int] = mapped_column(Integer, nullable=False)
    x2: Mapped[int] = mapped_column(Integer, nullable=False)
    y2: Mapped[int] = mapped_column(Integer, nullable=False)
    frame_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    timestamp_seconds: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    processing_timestamp: Mapped[str] = mapped_column(String(100), nullable=False)
    tracking_id: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
