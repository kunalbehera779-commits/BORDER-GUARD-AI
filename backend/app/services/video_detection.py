from __future__ import annotations

from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Iterator

from app.services.detector import YoloDetector
from app.services.video_ingestion import OpenCVVideoSource


MODEL_NAME = "yolo11n.pt"


@dataclass(frozen=True)
class Detection:
    class_name: str
    confidence: float
    frame_number: int
    timestamp_seconds: float
    bounding_box: tuple[int, int, int, int]

    def as_dict(self) -> dict[str, Any]:
        return asdict(self)


class VideoDetectionService:
    def __init__(self, model_name: str = MODEL_NAME, confidence_threshold: float = 0.25) -> None:
        self.detector = YoloDetector(model_name, confidence_threshold)

    def detect_video(self, video_path: str | Path) -> Iterator[Detection]:
        source = OpenCVVideoSource(Path(video_path))
        for frame in source.frames():
            for detection in self.detector.detect(frame.image, "local-video", frame.frame_number, frame.timestamp_seconds):
                yield Detection(detection.class_name, detection.confidence, frame.frame_number, frame.timestamp_seconds, detection.bounding_box)

    def detect_video_as_dicts(self, video_path: str | Path) -> list[dict[str, Any]]:
        return [detection.as_dict() for detection in self.detect_video(video_path)]
