from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np

from app.services.detector import DetectionResult
from app.services.environment import EnvironmentContext
from app.services.risk_engine import RiskEngine
from app.services.tracker import IoUTracker
from app.services.video_ingestion import OpenCVVideoSource, VideoSourceError
from app.services.zone_engine import ZoneDefinition, ZoneEngine, point_in_polygon


def detection(box=(10, 10, 30, 30), class_name="person", timestamp=0.0):
    return DetectionResult("CAM-01", class_name, 0.9, box, 1, timestamp, "2026-01-01T00:00:00+00:00")


def test_zone_geometry_and_entry_suppression():
    zone = ZoneDefinition("Z1", "CAM-01", "Restricted", [(0, 0), (100, 0), (100, 100), (0, 100)], "restricted")
    assert point_in_polygon((50, 50), zone.polygon)
    engine = ZoneEngine()
    tracker = IoUTracker()
    first = tracker.update([detection((10, 10, 20, 20))])[0]
    assert engine.evaluate(first, zone).transition == "entry"
    second = tracker.update([detection((11, 10, 21, 20), timestamp=1.0)])[0]
    assert engine.evaluate(second, zone) is None


def test_tracker_keeps_id_for_overlapping_object():
    tracker = IoUTracker()
    first = tracker.update([detection()])[0]
    second = tracker.update([detection((11, 10, 31, 30), timestamp=1.0)])[0]
    assert first.tracking_id == second.tracking_id


def test_risk_rules_use_zone_and_environment():
    zone = ZoneDefinition("Z1", "CAM-01", "Restricted", [(0, 0), (100, 0), (100, 100), (0, 100)], "restricted")
    transition = ZoneEngine().evaluate(IoUTracker().update([detection()])[0], zone)
    event = RiskEngine().evaluate(transition, 0.9, EnvironmentContext(low_light=True, visibility_level="low"))
    assert event is not None
    assert event.severity == "high"
    assert event.risk_score < 0.85


def test_video_metadata_and_streaming(tmp_path: Path):
    path = tmp_path / "sample.mp4"
    writer = cv2.VideoWriter(str(path), cv2.VideoWriter_fourcc(*"mp4v"), 10, (32, 24))
    for _ in range(4):
        writer.write(np.zeros((24, 32, 3), dtype=np.uint8))
    writer.release()
    source = OpenCVVideoSource(path)
    metadata = source.metadata()
    assert metadata.width == 32
    assert metadata.height == 24
    assert metadata.frame_count == 4
    assert len(list(source.frames(processing_fps=5))) in {2, 3}


def test_invalid_video_is_reported(tmp_path: Path):
    try:
        OpenCVVideoSource(tmp_path / "missing.mp4")
    except VideoSourceError:
        pass
    else:
        raise AssertionError("missing video should be rejected")
