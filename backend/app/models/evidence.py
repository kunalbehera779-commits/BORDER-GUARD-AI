from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Evidence(Base):
    __tablename__ = "evidence"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    event_id: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    camera_id: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    evidence_type: Mapped[str] = mapped_column(String(30), nullable=False, default="snapshot")
    path: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[str] = mapped_column(String(100), nullable=False)