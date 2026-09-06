from app.schemas.alert import AlertCreate, AlertRead
from app.schemas.camera import CameraCreate, CameraRead
from app.schemas.detection_event import DetectionEventCreate, DetectionEventRead
from app.schemas.incident import IncidentCreate, IncidentRead

__all__ = [
    "CameraCreate",
    "CameraRead",
    "AlertCreate",
    "AlertRead",
    "IncidentCreate",
    "IncidentRead",
    "DetectionEventCreate",
    "DetectionEventRead",
]
