from sqlalchemy import Boolean, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Zone(Base):
    __tablename__ = "zones"

    id: Mapped[str] = mapped_column(String(50), primary_key=True, index=True)
    camera_id: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    polygon: Mapped[list[list[float]]] = mapped_column(JSON, nullable=False)
    zone_type: Mapped[str] = mapped_column(String(50), nullable=False, default="monitored")
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)