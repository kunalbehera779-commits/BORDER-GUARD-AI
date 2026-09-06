from __future__ import annotations

import argparse
import json
from pathlib import Path

from app.services.video_detection import MODEL_NAME, VideoDetectionService


def main() -> None:
    parser = argparse.ArgumentParser(description="Run YOLO object detection on a local video file.")
    parser.add_argument("video_path", type=Path, help="Path to a local video file")
    parser.add_argument(
        "--confidence",
        type=float,
        default=0.25,
        help="Minimum detection confidence (default: 0.25)",
    )
    args = parser.parse_args()

    service = VideoDetectionService(confidence_threshold=args.confidence)
    detections = service.detect_video_as_dicts(args.video_path)
    print(json.dumps({"model": MODEL_NAME, "video": str(args.video_path), "detections": detections}, indent=2))


if __name__ == "__main__":
    main()
