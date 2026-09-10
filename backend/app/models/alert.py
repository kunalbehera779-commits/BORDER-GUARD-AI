from __future__ import annotations

from sqlalchemy import Float, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    severity: Mapped[str] = mapped_column(String(50), nullable=False, default="medium")
    camera_id: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    camera_name: Mapped[str] = mapped_column(String(200), nullable=False)
    timestamp: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="open")
    details: Mapped[str | None] = mapped_column(Text, nullable=True)
    event_id: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    zone_id: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    risk_score: Mapped[float | None] = mapped_column(Float, nullable=True)
