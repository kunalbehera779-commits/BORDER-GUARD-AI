from __future__ import annotations

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    event_type: Mapped[str] = mapped_column(String(200), nullable=False)
    camera_id: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    camera_name: Mapped[str] = mapped_column(String(200), nullable=False)
    severity: Mapped[str] = mapped_column(String(50), nullable=False, default="medium")
    timestamp: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="open")
    details: Mapped[str | None] = mapped_column(Text, nullable=True)
