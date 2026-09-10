from app.schemas.alert import AlertCreate, AlertRead
from app.schemas.camera import CameraCreate, CameraRead
from app.schemas.detection_event import DetectionEventCreate, DetectionEventRead
from app.schemas.incident import IncidentCreate, IncidentRead
from app.schemas.zone import ZoneCreate, ZoneRead
from app.schemas.detection import DetectionRead

__all__ = [
    "CameraCreate",
    "CameraRead",
    "AlertCreate",
    "AlertRead",
    "IncidentCreate",
    "IncidentRead",
    "DetectionEventCreate",
    "DetectionEventRead",
    "ZoneCreate",
    "ZoneRead",
    "DetectionRead",
]
