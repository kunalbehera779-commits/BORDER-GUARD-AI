from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.evidence import EvidenceItem

router = APIRouter()

@router.get("/")
def list_evidence_items(
    camera_id: Optional[str] = None,
    media_type: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(EvidenceItem)
    if camera_id:
        query = query.filter(EvidenceItem.camera_id == camera_id)
    if media_type:
        query = query.filter(EvidenceItem.media_type == media_type)
    return query.order_by(EvidenceItem.timestamp.desc()).limit(limit).all()
