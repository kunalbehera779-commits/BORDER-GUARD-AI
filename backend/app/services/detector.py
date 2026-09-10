from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Callable

logger = logging.getLogger(__name__)

SUPPORTED_CLASSES = frozenset({"person", "car", "truck", "bus", "animal", "drone", "motorcycle"})


@dataclass(frozen=True)
class DetectionResult:
    camera_id: str
    class_name: str
    confidence: float
    bounding_box: tuple[int, int, int, int]
    frame_number: int | None
    timestamp_seconds: float
    processing_timestamp: str


class YoloDetector:
    def __init__(self, model_path: str, confidence_threshold: float = 0.25, iou_threshold: float = 0.45, model: Any = None) -> None:
        self.model_path = model_path
        self.confidence_threshold = confidence_threshold
        self.iou_threshold = iou_threshold
        self._model = model
        self._class_names: dict[int, str] = {}

    @property
    def model(self) -> Any:
        if self._model is None:
            from ultralytics import YOLO
            logger.info("Loading YOLO model", extra={"model": self.model_path})
            self._model = YOLO(self.model_path)
            self._class_names = dict(self._model.names)
        elif not self._class_names and hasattr(self._model, "names"):
            self._class_names = dict(self._model.names)
        return self._model

    def detect(self, image: Any, camera_id: str, frame_number: int | None = None, timestamp_seconds: float = 0.0) -> list[DetectionResult]:
        results = self.model(image, conf=self.confidence_threshold, iou=self.iou_threshold, verbose=False)
        detections: list[DetectionResult] = []
        names = self._class_names or dict(getattr(self.model, "names", {}))
        for result in results:
            if result.boxes is None:
                continue
            for box in result.boxes:
                class_id = int(box.cls[0].item())
                class_name = str(names.get(class_id, class_id)).lower()
                if class_name not in SUPPORTED_CLASSES:
                    continue
                coordinates = box.xyxy[0].tolist()
                detections.append(DetectionResult(
                    camera_id=camera_id,
                    class_name=class_name,
                    confidence=float(box.conf[0].item()),
                    bounding_box=tuple(int(round(value)) for value in coordinates),
                    frame_number=frame_number,
                    timestamp_seconds=timestamp_seconds,
                    processing_timestamp=datetime.now(timezone.utc).isoformat(),
                ))
        return detections
