from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class ZoneBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    cameraId: str = Field(validation_alias="camera_id", serialization_alias="cameraId")
    name: str
    polygon: list[list[float]]
    zoneType: str = Field(default="monitored", validation_alias="zone_type", serialization_alias="zoneType")
    enabled: bool = True


class ZoneCreate(ZoneBase):
    pass


class ZoneRead(ZoneBase):
    pass