from __future__ import annotations

import json
import logging
import uuid
from pathlib import Path
from typing import Any

import cv2
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.alert import Alert
from app.models.detection import Detection
from app.models.detection_event import DetectionEvent
from app.models.evidence import Evidence
from app.models.incident import Incident
from app.models.zone import Zone
from app.services.detector import DetectionResult, YoloDetector
from app.services.environment import EnvironmentContext
from app.services.risk_engine import RiskEngine
from app.services.tracker import IoUTracker
from app.services.video_ingestion import OpenCVVideoSource
from app.services.websocket_manager import ConnectionManager, manager
from app.services.zone_engine import ZoneDefinition, ZoneEngine

logger = logging.getLogger(__name__)


def _id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:10].upper()}"


def _zone_from_model(zone: Zone) -> ZoneDefinition:
    return ZoneDefinition(
        id=zone.id,
        camera_id=zone.camera_id,
        name=zone.name,
        polygon=[(float(point[0]), float(point[1])) for point in zone.polygon],
        zone_type=zone.zone_type,
        enabled=zone.enabled,
    )


def process_video(
    video_path: str | Path,
    camera_id: str,
    db: Session,
    detector: YoloDetector | Any,
    processing_fps: float | None = None,
    environment: EnvironmentContext | None = None,
    connections: ConnectionManager = manager,
) -> dict[str, int]:
    source = OpenCVVideoSource(video_path)
    zones = [_zone_from_model(zone) for zone in db.query(Zone).filter(Zone.camera_id == camera_id, Zone.enabled.is_(True)).all()]
    tracker = IoUTracker()
    zone_engine = ZoneEngine()
    risk_engine = RiskEngine()
    context = environment or EnvironmentContext()
    evidence_dir = Path(settings.evidence_dir)
    evidence_dir.mkdir(parents=True, exist_ok=True)
    counts = {"frames": 0, "detections": 0, "events": 0, "alerts": 0, "incidents": 0, "evidence": 0}
    logger.info("Video processing started", extra={"video": str(video_path), "camera_id": camera_id})
    for frame in source.frames(processing_fps or settings.processing_fps):
        counts["frames"] += 1
        detections = detector.detect(frame.image, camera_id, frame.frame_number, frame.timestamp_seconds)
        counts["detections"] += len(detections)
        tracked = tracker.update(detections)
        for tracked_detection in tracked:
            detection = tracked_detection.detection
            detection_id = _id("DET")
            x1, y1, x2, y2 = detection.bounding_box
            db.add(Detection(id=detection_id, camera_id=camera_id, class_name=detection.class_name, confidence=detection.confidence, x1=x1, y1=y1, x2=x2, y2=y2, frame_number=detection.frame_number, timestamp_seconds=detection.timestamp_seconds, processing_timestamp=detection.processing_timestamp, tracking_id=tracked_detection.tracking_id))
            for zone in zones:
                transition = zone_engine.evaluate(tracked_detection, zone)
                if transition is None:
                    continue
                risk = risk_engine.evaluate(transition, detection.confidence, context)
                if risk is None:
                    continue
                event_id = _id("EVT")
                timestamp = detection.processing_timestamp
                event = DetectionEvent(id=event_id, severity=risk.severity, name=risk.event_type, camera_id=camera_id, camera_name=camera_id, timestamp=timestamp, confidence=detection.confidence, status="open", detail=risk.reason, track_id=tracked_detection.tracking_id, detection_kind=detection.class_name, event_count=1, zone_id=zone.id, risk_score=risk.risk_score, event_type=risk.event_type, environment_context=json.dumps(risk.environment_context))
                db.add(event)
                counts["events"] += 1
                if risk.severity in {"medium", "high", "critical"}:
                    alert_id = _id("ALT")
                    db.add(Alert(id=alert_id, event_id=event_id, title=risk.event_type, severity=risk.severity, camera_id=camera_id, camera_name=camera_id, timestamp=timestamp, status="new", details=risk.reason, zone_id=zone.id, risk_score=risk.risk_score))
                    counts["alerts"] += 1
                    incident_id = _id("INC")
                    evidence_path = evidence_dir / f"{event_id}.jpg"
                    if cv2.imwrite(str(evidence_path), frame.image):
                        db.add(Evidence(id=_id("EVD"), event_id=event_id, camera_id=camera_id, evidence_type="snapshot", path=str(evidence_path), created_at=timestamp))
                        counts["evidence"] += 1
                        evidence_reference = str(evidence_path)
                    else:
                        evidence_reference = None
                    db.add(Incident(id=incident_id, event_id=event_id, event_type=risk.event_type, camera_id=camera_id, camera_name=camera_id, severity=risk.severity, timestamp=timestamp, status="open", details=risk.reason, object_type=risk.object_type, tracking_id=risk.tracking_id, confidence=detection.confidence, evidence_path=evidence_reference))
                    counts["incidents"] += 1
                    db.commit()
                    logger.info("Risk event generated", extra={"event_id": event_id, "alert_id": alert_id, "camera_id": camera_id})
                    import asyncio
                    try:
                        asyncio.get_running_loop().create_task(connections.broadcast("new_alert", {"event_id": event_id, "alert_id": alert_id, "severity": risk.severity, "camera_id": camera_id, "zone_id": zone.id}))
                    except RuntimeError:
                        logger.debug("No async loop available for WebSocket broadcast")
                else:
                    db.commit()
    logger.info("Video processing completed", extra={"camera_id": camera_id, "counts": counts})
    return counts
