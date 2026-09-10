from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.anpr import ANPRRecord

router = APIRouter()

@router.get("/")
def list_anpr_records(
    plate: Optional[str] = None,
    watchlist_only: bool = False,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(ANPRRecord)
    if plate:
        query = query.filter(ANPRRecord.plate_number.like(f"%{plate}%"))
    if watchlist_only:
        query = query.filter(ANPRRecord.is_watchlist_match == True)
    return query.order_by(ANPRRecord.timestamp.desc()).limit(limit).all()
