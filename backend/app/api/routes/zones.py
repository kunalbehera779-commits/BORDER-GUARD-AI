from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.zone import Zone
from app.schemas.zone import ZoneCreate, ZoneRead

router = APIRouter(tags=["zones"])


@router.get("/zones", response_model=list[ZoneRead])
def list_zones(camera_id: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Zone)
    if camera_id:
        query = query.filter(Zone.camera_id == camera_id)
    return query.all()


@router.post("/zones", response_model=ZoneRead, status_code=status.HTTP_201_CREATED)
def create_zone(zone: ZoneCreate, db: Session = Depends(get_db)):
    if len(zone.polygon) < 3:
        raise HTTPException(status_code=422, detail="A zone polygon requires at least three points")
    if db.get(Zone, zone.id):
        raise HTTPException(status_code=400, detail="Zone already exists")
    payload = zone.model_dump()
    item = Zone(
        id=payload["id"], camera_id=payload["cameraId"], name=payload["name"],
        polygon=payload["polygon"], zone_type=payload["zoneType"], enabled=payload["enabled"],
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
