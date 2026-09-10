from __future__ import annotations

from dataclasses import dataclass

from app.services.detector import DetectionResult


@dataclass(frozen=True)
class TrackedDetection:
    detection: DetectionResult
    tracking_id: str
    first_seen_seconds: float
    last_seen_seconds: float


def _iou(first: tuple[int, int, int, int], second: tuple[int, int, int, int]) -> float:
    left = max(first[0], second[0])
    top = max(first[1], second[1])
    right = min(first[2], second[2])
    bottom = min(first[3], second[3])
    intersection = max(0, right - left) * max(0, bottom - top)
    first_area = max(0, first[2] - first[0]) * max(0, first[3] - first[1])
    second_area = max(0, second[2] - second[0]) * max(0, second[3] - second[1])
    union = first_area + second_area - intersection
    return intersection / union if union else 0.0


class IoUTracker:
    def __init__(self, iou_threshold: float = 0.3, max_missing_frames: int = 30) -> None:
        self.iou_threshold = iou_threshold
        self.max_missing_frames = max_missing_frames
        self._tracks: dict[str, TrackedDetection] = {}
        self._missing: dict[str, int] = {}
        self._next_id = 1

    def update(self, detections: list[DetectionResult]) -> list[TrackedDetection]:
        available = set(self._tracks)
        updated: list[TrackedDetection] = []
        for detection in detections:
            match_id = max(
                available,
                key=lambda track_id: _iou(self._tracks[track_id].detection.bounding_box, detection.bounding_box),
                default=None,
            )
            if match_id is not None and _iou(self._tracks[match_id].detection.bounding_box, detection.bounding_box) >= self.iou_threshold and self._tracks[match_id].detection.class_name == detection.class_name:
                previous = self._tracks[match_id]
                tracked = TrackedDetection(detection, match_id, previous.first_seen_seconds, detection.timestamp_seconds)
                available.remove(match_id)
            else:
                match_id = f"T{self._next_id:03d}"
                self._next_id += 1
                tracked = TrackedDetection(detection, match_id, detection.timestamp_seconds, detection.timestamp_seconds)
            self._tracks[match_id] = tracked
            self._missing[match_id] = 0
            updated.append(tracked)
        for track_id in available:
            self._missing[track_id] += 1
            if self._missing[track_id] > self.max_missing_frames:
                self._tracks.pop(track_id, None)
                self._missing.pop(track_id, None)
        return updated
