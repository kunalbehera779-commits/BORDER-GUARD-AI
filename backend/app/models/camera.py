from __future__ import annotations

from sqlalchemy import Boolean, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Camera(Base):
    __tablename__ = "cameras"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    sector: Mapped[str] = mapped_column(String(200), nullable=False, default="Sector Alpha")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="online")
    ai_status: Mapped[str] = mapped_column(String(50), nullable=False, default="active")
    scene: Mapped[str] = mapped_column(String(50), nullable=False, default="gate")
    signal_quality: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    resolution: Mapped[str] = mapped_column(String(50), nullable=False, default="1920×1080")
    fps: Mapped[int] = mapped_column(Integer, nullable=False, default=25)
    environment: Mapped[str] = mapped_column(String(50), nullable=False, default="Daylight")
    current_event: Mapped[str | None] = mapped_column(Text, nullable=True)
    virtual_fence: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    fence_breached: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
