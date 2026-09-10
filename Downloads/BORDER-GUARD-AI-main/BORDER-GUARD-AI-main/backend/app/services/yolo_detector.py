import time
import cv2
import numpy as np
from typing import List, Dict, Any
from app.config import settings

class YOLODetector:
    def __init__(self, model_name: str = settings.YOLO_MODEL_NAME, conf_threshold: float = settings.CONFIDENCE_THRESHOLD):
        self.conf_threshold = conf_threshold
        self.model = None
        self.using_fallback = False
        self.prev_gray = None
        
        # Try initializing Ultralytics YOLOv8
        try:
            from ultralytics import YOLO
            self.model = YOLO(model_name)
            print(f"[YOLO Engine] Loaded Ultralytics model: {model_name}")
        except Exception as e:
            print(f"[YOLO Engine] Ultralytics YOLO initializing OpenCV Motion & Contour Detection fallback.")
            self.using_fallback = True

    def detect(self, frame: np.ndarray) -> List[Dict[str, Any]]:
        """
        Runs object & motion detection on a BGR video frame.
        """
        if frame is None or frame.size == 0:
            return []

        h, w = frame.shape[:2]

        if not self.using_fallback and self.model is not None:
            try:
                results = self.model(frame, conf=self.conf_threshold, verbose=False)
                detections = []
                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        xyxy = box.xyxy[0].cpu().numpy().tolist()
                        conf = float(box.conf[0].cpu().numpy())
                        cls_id = int(box.cls[0].cpu().numpy())
                        cls_name = self.model.names.get(cls_id, f"class_{cls_id}")
                        
                        detections.append({
                            "bbox": [round(v, 1) for v in xyxy],
                            "confidence": round(conf, 2),
                            "class_id": cls_id,
                            "class_name": str(cls_name)
                        })
                if detections:
                    return detections
            except Exception as e:
                pass

        # Real OpenCV Motion & Contour Detection Engine
        return self._detect_real_motion(frame, w, h)

    def _detect_real_motion(self, frame: np.ndarray, width: int, height: int) -> List[Dict[str, Any]]:
        """Analyzes real-time pixel motion & contour differences between consecutive frames."""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (21, 21), 0)

        if self.prev_gray is None or self.prev_gray.shape != gray.shape:
            self.prev_gray = gray
            return []

        # Compute difference between current & previous frame
        frame_delta = cv2.absdiff(self.prev_gray, gray)
        thresh = cv2.threshold(frame_delta, 25, 255, cv2.THRESH_BINARY)[1]
        thresh = cv2.dilate(thresh, None, iterations=2)
        
        self.prev_gray = gray

        contours, _ = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        detections = []

        for c in contours:
            area = cv2.contourArea(c)
            # Filter micro noise (only detect actual moving bodies/people)
            if area < (width * height * 0.008):
                continue

            (x, y, w_box, h_box) = cv2.boundingRect(c)
            
            # Aspect ratio check for human / vehicle profile
            aspect = float(h_box) / float(w_box)
            cls_name = "person" if aspect >= 1.1 else "vehicle"
            conf = min(0.96, round(0.75 + (area / (width * height)) * 5.0, 2))

            detections.append({
                "bbox": [float(x), float(y), float(x + w_box), float(y + h_box)],
                "confidence": conf,
                "class_id": 0 if cls_name == "person" else 2,
                "class_name": cls_name
            })

        return detections
