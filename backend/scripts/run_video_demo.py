from __future__ import annotations

import argparse
import json
from pathlib import Path

from app.core.config import settings
from app.db.database import Base, SessionLocal, engine
from app.models import Camera
from app.services.detector import YoloDetector
from app.services.pipeline import process_video


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the local MP4 BORDER-GUARD-AI surveillance pipeline.")
    parser.add_argument("video_path", type=Path)
    parser.add_argument("--camera-id", default="DEMO-CAM")
    parser.add_argument("--model", default=settings.yolo_model_path)
    parser.add_argument("--confidence", type=float, default=settings.detection_confidence)
    parser.add_argument("--processing-fps", type=float, default=settings.processing_fps)
    args = parser.parse_args()
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.get(Camera, args.camera_id) is None:
            db.add(Camera(id=args.camera_id, name=args.camera_id, sector="Demo", status="online", ai_status="active"))
            db.commit()
        result = process_video(args.video_path, args.camera_id, db, YoloDetector(args.model, args.confidence, settings.detection_iou), args.processing_fps)
        print(json.dumps({"video": str(args.video_path), "camera_id": args.camera_id, "result": result}, indent=2))
    finally:
        db.close()


if __name__ == "__main__":
    main()
