from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Iterator, Protocol

import cv2

logger = logging.getLogger(__name__)


class VideoSourceError(ValueError):
    pass


@dataclass(frozen=True)
class VideoMetadata:
    path: str
    width: int
    height: int
    fps: float
    frame_count: int | None
    duration_seconds: float | None


@dataclass(frozen=True)
class VideoFrame:
    image: object
    frame_number: int
    timestamp_seconds: float


class FrameSource(Protocol):
    def metadata(self) -> VideoMetadata: ...
    def frames(self, processing_fps: float | None = None) -> Iterator[VideoFrame]: ...


class OpenCVVideoSource:
    def __init__(self, video_path: str | Path) -> None:
        self.path = Path(video_path)
        if not self.path.is_file():
            raise VideoSourceError(f"Video file not found: {self.path}")

    def _open(self) -> cv2.VideoCapture:
        capture = cv2.VideoCapture(str(self.path))
        if not capture.isOpened():
            capture.release()
            raise VideoSourceError(f"Unable to open video file: {self.path}")
        return capture

    def metadata(self) -> VideoMetadata:
        capture = self._open()
        try:
            fps = float(capture.get(cv2.CAP_PROP_FPS) or 0.0)
            frame_count_value = int(capture.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
            duration = frame_count_value / fps if fps > 0 and frame_count_value > 0 else None
            return VideoMetadata(
                path=str(self.path),
                width=int(capture.get(cv2.CAP_PROP_FRAME_WIDTH) or 0),
                height=int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0),
                fps=fps,
                frame_count=frame_count_value or None,
                duration_seconds=duration,
            )
        finally:
            capture.release()

    def frames(self, processing_fps: float | None = None) -> Iterator[VideoFrame]:
        capture = self._open()
        source_fps = float(capture.get(cv2.CAP_PROP_FPS) or 0.0)
        sample_every = 1
        if processing_fps and source_fps > 0 and processing_fps < source_fps:
            sample_every = max(1, round(source_fps / processing_fps))
        frame_number = 0
        try:
            while True:
                has_frame, image = capture.read()
                if not has_frame:
                    break
                if frame_number % sample_every == 0:
                    timestamp = frame_number / source_fps if source_fps > 0 else 0.0
                    yield VideoFrame(image=image, frame_number=frame_number, timestamp_seconds=timestamp)
                frame_number += 1
        except cv2.error as exc:
            logger.exception("Video frame processing failed", extra={"video": str(self.path)})
            raise VideoSourceError(f"Unable to decode video: {self.path}") from exc
        finally:
            capture.release()
            logger.info("Video source released", extra={"video": str(self.path), "frames": frame_number})
