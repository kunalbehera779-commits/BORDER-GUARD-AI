from __future__ import annotations

from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Iterator

import cv2
from ultralytics import YOLO


MODEL_NAME = "yolo11n.pt"
TARGET_CLASSES = frozenset({"person", "car", "motorcycle", "bus", "truck"})


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
        self.model = YOLO(model_name)
        self.confidence_threshold = confidence_threshold
        self.class_names = self.model.names
        self.target_class_ids = {
            class_id for class_id, class_name in self.class_names.items() if class_name in TARGET_CLASSES
        }

    def detect_video(self, video_path: str | Path) -> Iterator[Detection]:
        path = Path(video_path)
        if not path.is_file():
            raise FileNotFoundError(f"Video file not found: {path}")

        capture = cv2.VideoCapture(str(path))
        if not capture.isOpened():
            raise ValueError(f"Unable to open video file: {path}")

        fps = capture.get(cv2.CAP_PROP_FPS)
        fps = fps if fps > 0 else 0.0
        frame_number = 0

        try:
            while True:
                has_frame, frame = capture.read()
                if not has_frame:
                    break

                results = self.model(frame, conf=self.confidence_threshold, verbose=False)
                for result in results:
                    if result.boxes is None:
                        continue

                    for box in result.boxes:
                        class_id = int(box.cls[0].item())
                        if class_id not in self.target_class_ids:
                            continue

                        coordinates = box.xyxy[0].tolist()
                        yield Detection(
                            class_name=self.class_names[class_id],
                            confidence=float(box.conf[0].item()),
                            frame_number=frame_number,
                            timestamp_seconds=frame_number / fps if fps else 0.0,
                            bounding_box=tuple(int(round(value)) for value in coordinates),
                        )

                frame_number += 1
        finally:
            capture.release()

    def detect_video_as_dicts(self, video_path: str | Path) -> list[dict[str, Any]]:
        return [detection.as_dict() for detection in self.detect_video(video_path)]
