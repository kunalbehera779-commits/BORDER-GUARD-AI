from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.alert import Alert
from app.schemas.alert import AlertCreate, AlertRead

router = APIRouter(tags=["alerts"])


@router.get("/alerts", response_model=list[AlertRead])
def list_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).all()


@router.get("/alerts/{alert_id}", response_model=AlertRead)
def get_alert(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    return alert


@router.post("/alerts", response_model=AlertRead, status_code=status.HTTP_201_CREATED)
def create_alert(alert: AlertCreate, db: Session = Depends(get_db)):
    existing = db.query(Alert).filter(Alert.id == alert.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Alert already exists")

    db_alert = Alert(**alert.model_dump(by_alias=True))
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert
