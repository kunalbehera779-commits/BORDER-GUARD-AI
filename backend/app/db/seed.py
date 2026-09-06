from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from app.db.database import Base, SessionLocal, engine
from app.models.alert import Alert
from app.models.camera import Camera
from app.models.detection_event import DetectionEvent
from app.models.incident import Incident

CAMERA_SEED = [
    {
        "id": "CAM-01",
        "name": "North Gate",
        "sector": "Sector Alpha",
        "status": "online",
        "ai_status": "active",
        "scene": "gate",
        "signal_quality": 94,
        "resolution": "1920×1080",
        "fps": 25,
        "environment": "Daylight",
        "current_event": "Vehicle entered monitored zone",
        "virtual_fence": False,
        "fence_breached": False,
        "latitude": 28.6139,
        "longitude": 77.2090,
        "notes": "Primary gate approach monitoring.",
    },
    {
        "id": "CAM-02",
        "name": "River Sector",
        "sector": "Sector Alpha",
        "status": "online",
        "ai_status": "active",
        "scene": "river",
        "signal_quality": 88,
        "resolution": "1920×1080",
        "fps": 24,
        "environment": "Fog",
        "current_event": "Restricted zone proximity",
        "virtual_fence": True,
        "fence_breached": True,
        "latitude": 28.6156,
        "longitude": 77.2114,
        "notes": "River boundary with reduced visibility.",
    },
    {
        "id": "CAM-03",
        "name": "Checkpoint",
        "sector": "Sector Alpha",
        "status": "online",
        "ai_status": "active",
        "scene": "checkpoint",
        "signal_quality": 96,
        "resolution": "1920×1080",
        "fps": 25,
        "environment": "Daylight",
        "current_event": None,
        "virtual_fence": False,
        "fence_breached": False,
        "latitude": 28.6127,
        "longitude": 77.2058,
        "notes": "Vehicle verification lane monitoring.",
    },
    {
        "id": "CAM-04",
        "name": "Hill Sector",
        "sector": "Sector Alpha",
        "status": "online",
        "ai_status": "active",
        "scene": "hill",
        "signal_quality": 81,
        "resolution": "1920×1080",
        "fps": 24,
        "environment": "Low Light",
        "current_event": "Possible aerial object",
        "virtual_fence": False,
        "fence_breached": False,
        "latitude": 28.6178,
        "longitude": 77.2161,
        "notes": "High vantage point for suspicious aerial activity.",
    },
]

ALERT_SEED = [
    {
        "id": "ALT-8841",
        "title": "Unverified person detected near restricted zone",
        "severity": "critical",
        "camera_id": "CAM-02",
        "camera_name": "CAM-02 River Sector",
        "timestamp": "2026-09-06T03:26:41+05:30",
        "status": "open",
        "details": "Unverified person near restricted river sector.",
    },
    {
        "id": "ALT-8837",
        "title": "Virtual fence breach detected",
        "severity": "high",
        "camera_id": "CAM-04",
        "camera_name": "CAM-04 Hill Sector",
        "timestamp": "2026-09-06T03:21:08+05:30",
        "status": "reviewing",
        "details": "Virtual fence boundary crossed at ridge sector.",
    },
    {
        "id": "ALT-8832",
        "title": "Vehicle detected in restricted sector",
        "severity": "high",
        "camera_id": "CAM-01",
        "camera_name": "CAM-01 North Gate",
        "timestamp": "2026-09-06T03:14:52+05:30",
        "status": "acknowledged",
        "details": "Vehicle entered restricted monitored zone.",
    },
    {
        "id": "ALT-8826",
        "title": "Drone detected in restricted airspace",
        "severity": "critical",
        "camera_id": "CAM-04",
        "camera_name": "CAM-04 Hill Sector",
        "timestamp": "2026-09-06T02:58:17+05:30",
        "status": "open",
        "details": "Possible aerial object near restricted airspace.",
    },
]

INCIDENT_SEED = [
    {
        "id": "INC-1204",
        "event_type": "Virtual fence breach",
        "camera_id": "CAM-04",
        "camera_name": "CAM-04 Hill Sector",
        "severity": "high",
        "timestamp": "2026-09-06T03:21:08+05:30",
        "status": "investigating",
        "details": "Operator review for rail/edge anomaly near ridge sector.",
    },
    {
        "id": "INC-1203",
        "event_type": "Unverified person near restricted zone",
        "camera_id": "CAM-02",
        "camera_name": "CAM-02 River Sector",
        "severity": "critical",
        "timestamp": "2026-09-06T03:26:41+05:30",
        "status": "open",
        "details": "Restricted zone intrusion pattern observed near river boundary.",
    },
    {
        "id": "INC-1198",
        "event_type": "Unauthorized vehicle movement",
        "camera_id": "CAM-01",
        "camera_name": "CAM-01 North Gate",
        "severity": "high",
        "timestamp": "2026-09-06T03:14:52+05:30",
        "status": "investigating",
        "details": "Vehicle movement did not match expected route clearance.",
    },
    {
        "id": "INC-1191",
        "event_type": "Possible aerial object",
        "camera_id": "CAM-04",
        "camera_name": "CAM-04 Hill Sector",
        "severity": "critical",
        "timestamp": "2026-09-06T02:58:17+05:30",
        "status": "open",
        "details": "Low-light aerial trail observed near hill sector.",
    },
    {
        "id": "INC-1176",
        "event_type": "ANPR mismatch at checkpoint",
        "camera_id": "CAM-03",
        "camera_name": "CAM-03 Checkpoint",
        "severity": "medium",
        "timestamp": "2026-09-06T01:42:09+05:30",
        "status": "resolved",
        "details": "Vehicle identity mismatch flagged for manual check.",
    },
]

DETECTION_EVENT_SEED = [
    {
        "id": "EVT-4408",
        "severity": "critical",
        "name": "Possible aerial object in restricted airspace",
        "camera_id": "CAM-04",
        "camera_name": "CAM-04 Hill Sector",
        "timestamp": "2026-09-06T09:21:43+05:30",
        "confidence": 76.0,
        "status": "open",
        "detail": "Simulated detection of a possible aerial object near restricted airspace.",
        "track_id": "#A012",
        "detection_kind": "aerial",
        "event_count": 1,
    },
    {
        "id": "EVT-4404",
        "severity": "high",
        "name": "Virtual fence breach detected",
        "camera_id": "CAM-02",
        "camera_name": "CAM-02 River Sector",
        "timestamp": "2026-09-06T09:20:18+05:30",
        "confidence": 87.0,
        "status": "reviewing",
        "detail": "Boundary overlay triggered by unverified person activity.",
        "track_id": "#P109",
        "detection_kind": "person",
        "event_count": 1,
    },
    {
        "id": "EVT-4399",
        "severity": "medium",
        "name": "Vehicle entered monitored zone",
        "camera_id": "CAM-01",
        "camera_name": "CAM-01 North Gate",
        "timestamp": "2026-09-06T09:19:52+05:30",
        "confidence": 81.0,
        "status": "acknowledged",
        "detail": "Vehicle tracked entering the North Gate monitored zone.",
        "track_id": "#V031",
        "detection_kind": "vehicle",
        "event_count": 1,
    },
    {
        "id": "EVT-4388",
        "severity": "low",
        "name": "Animal detected near perimeter",
        "camera_id": "CAM-03",
        "camera_name": "CAM-03 Checkpoint",
        "timestamp": "2026-09-06T09:18:41+05:30",
        "confidence": 68.0,
        "status": "resolved",
        "detail": "Low-priority wildlife movement near checkpoint perimeter.",
        "track_id": "#AN07",
        "detection_kind": "animal",
        "event_count": 1,
    },
    {
        "id": "EVT-4380",
        "severity": "high",
        "name": "Person detected near access control lane",
        "camera_id": "CAM-01",
        "camera_name": "CAM-01 North Gate",
        "timestamp": "2026-09-06T09:11:30+05:30",
        "confidence": 92.0,
        "status": "open",
        "detail": "Person detection near access lane with poor identity confirmation.",
        "track_id": "#P104",
        "detection_kind": "person",
        "event_count": 1,
    },
]


def _upsert_camera(db: Session, payload: dict[str, Any]) -> None:
    obj = db.get(Camera, payload["id"])
    if obj is None:
        obj = Camera(**payload)
        db.add(obj)
    else:
        for key, value in payload.items():
            setattr(obj, key, value)


def _upsert_alert(db: Session, payload: dict[str, Any]) -> None:
    obj = db.get(Alert, payload["id"])
    if obj is None:
        obj = Alert(**payload)
        db.add(obj)
    else:
        for key, value in payload.items():
            setattr(obj, key, value)


def _upsert_incident(db: Session, payload: dict[str, Any]) -> None:
    obj = db.get(Incident, payload["id"])
    if obj is None:
        obj = Incident(**payload)
        db.add(obj)
    else:
        for key, value in payload.items():
            setattr(obj, key, value)


def _upsert_detection_event(db: Session, payload: dict[str, Any]) -> None:
    obj = db.get(DetectionEvent, payload["id"])
    if obj is None:
        obj = DetectionEvent(**payload)
        db.add(obj)
    else:
        for key, value in payload.items():
            setattr(obj, key, value)


def seed_database() -> dict[str, int]:
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        for payload in CAMERA_SEED:
            _upsert_camera(db, payload)

        for payload in ALERT_SEED:
            _upsert_alert(db, payload)

        for payload in INCIDENT_SEED:
            _upsert_incident(db, payload)

        for payload in DETECTION_EVENT_SEED:
            _upsert_detection_event(db, payload)

        db.commit()

    return {
        "cameras": len(CAMERA_SEED),
        "alerts": len(ALERT_SEED),
        "incidents": len(INCIDENT_SEED),
        "detection_events": len(DETECTION_EVENT_SEED),
    }


if __name__ == "__main__":
    print(seed_database())
