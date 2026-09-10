import cv2
import time
import base64
import threading
import numpy as np
from typing import Dict, Optional, Tuple, Any
from app.services.yolo_detector import YOLODetector
from app.services.tracker import SimpleTracker
from app.services.virtual_fence import VirtualFenceEngine
from app.services.risk_engine import RiskEngine
from app.utils.draw import draw_annotations

class CameraStreamWorker(threading.Thread):
    """
    Background worker thread per camera feeding live video, running inference,
    drawing overlays, and serving WebSocket subscribers.
    """
    def __init__(
        self,
        camera_id: str,
        name: str,
        stream_url: str,
        stream_type: str = "webcam",
        sector: str = "Sector Alpha",
        virtual_fence: Optional[Any] = None,
        target_fps: int = 25
    ):
        super().__init__(daemon=True)
        self.camera_id = camera_id
        self.camera_name = name
        self.stream_url = stream_url.strip()
        self.stream_type = stream_type
        self.sector = sector
        self.virtual_fence = virtual_fence
        self.target_fps = target_fps
        self.is_running = True
        
        # Pipeline Services
        self.detector = YOLODetector()
        self.tracker = SimpleTracker()
        self.fence_engine = VirtualFenceEngine()
        self.risk_engine = RiskEngine()
        
        # Latest Processed Output State
        self.latest_jpeg_bytes: Optional[bytes] = None
        self.latest_base64: Optional[str] = None
        self.latest_metadata: Dict[str, Any] = {
            "camera_id": camera_id,
            "risk_score": 10.0,
            "detections": []
        }
        self.lock = threading.Lock()

    def run(self):
        print(f"[Stream Worker] Starting stream worker for camera '{self.camera_name}' ({self.camera_id})...")
        
        source = int(self.stream_url) if self.stream_url.isdigit() else self.stream_url
        is_synthetic = self.stream_type == "synthetic" or self.stream_url == "synthetic"
        
        def open_video_capture(src):
            if isinstance(src, int):
                cap_obj = cv2.VideoCapture(src, cv2.CAP_DSHOW)
                if cap_obj.isOpened():
                    return cap_obj
                cap_obj = cv2.VideoCapture(src, cv2.CAP_MSMF)
                if cap_obj.isOpened():
                    return cap_obj
                return cv2.VideoCapture(src)
            return cv2.VideoCapture(src)

        cap = None
        if not is_synthetic:
            cap = open_video_capture(source)

        frame_delay = 1.0 / float(self.target_fps)
        synthetic_angle = 0.0

        while self.is_running:
            loop_start = time.time()
            frame = None

            if not is_synthetic and cap is not None:
                if not cap.isOpened():
                    # Attempt reconnect
                    time.sleep(2.0)
                    cap = open_video_capture(source)
                    continue
                    
                ret, frame = cap.read()
                if not ret or frame is None:
                    # Retry reading or reopening camera
                    time.sleep(0.5)
                    ret, frame = cap.read()
                    if not ret or frame is None:
                        if self.stream_type == "file":
                            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                        else:
                            cap.release()
                            cap = open_video_capture(source)
                        continue

            # Generate synthetic demo pattern if camera feed is synthetic or unavailable
            if frame is None or is_synthetic:
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
                synthetic_angle += 0.05
                # Grid background pattern
                cv2.rectangle(frame, (0, 0), (640, 480), (25, 30, 40), -1)
                for x in range(0, 640, 40):
                    cv2.line(frame, (x, 0), (x, 480), (35, 45, 60), 1)
                for y in range(0, 480, 40):
                    cv2.line(frame, (0, y), (640, y), (35, 45, 60), 1)

            # 1. Run YOLO Object Detection
            raw_detections = self.detector.detect(frame)
            
            # 2. Run Object Tracking (ByteTrack IoU)
            tracked_detections = self.tracker.update(raw_detections)
            
            # 3. Process Virtual Fence Intrusion & Loitering
            evaluated_detections = self.fence_engine.process_detections(tracked_detections, self.virtual_fence)
            
            # 4. Calculate Dynamic Threat Risk Score
            risk_score = self.risk_engine.calculate_risk_score(evaluated_detections)
            
            # 5. Evaluate and trigger Database Alerts & Incidents
            created_alerts = self.risk_engine.evaluate_and_alert(
                camera_id=self.camera_id,
                camera_name=self.camera_name,
                sector=self.sector,
                detections=evaluated_detections,
                risk_score=risk_score,
                fence_config=self.virtual_fence
            )
            if created_alerts:
                try:
                    from app.websockets.alert_manager import broadcast_alert_sync
                    for alert_item in created_alerts:
                        broadcast_alert_sync(alert_item)
                except Exception:
                    pass
            
            # 6. Render Overlays & HUD
            annotated_frame = draw_annotations(
                frame=frame,
                detections=evaluated_detections,
                fence_data=self.virtual_fence,
                risk_score=risk_score,
                camera_name=self.camera_name
            )
            
            # 7. Encode to JPEG for WebSockets & Streaming
            ret_encode, buffer = cv2.imencode('.jpg', annotated_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
            if ret_encode:
                jpeg_bytes = buffer.tobytes()
                base64_str = base64.b64encode(jpeg_bytes).decode('utf-8')
                
                with self.lock:
                    self.latest_jpeg_bytes = jpeg_bytes
                    self.latest_base64 = base64_str
                    self.latest_metadata = {
                        "camera_id": self.camera_id,
                        "camera_name": self.camera_name,
                        "sector": self.sector,
                        "risk_score": risk_score,
                        "detections_count": len(evaluated_detections),
                        "detections": evaluated_detections,
                        "timestamp": time.time()
                    }

            # Rate Limiting FPS
            elapsed = time.time() - loop_start
            sleep_time = max(0.001, frame_delay - elapsed)
            time.sleep(sleep_time)

        if cap is not None:
            cap.release()
        print(f"[Stream Worker] Worker stopped for camera '{self.camera_name}'.")

    def stop(self):
        self.is_running = False

    def get_latest_frame(self) -> Tuple[Optional[bytes], Optional[str], Dict[str, Any]]:
        with self.lock:
            return self.latest_jpeg_bytes, self.latest_base64, self.latest_metadata


class StreamManager:
    """Global Registry managing active background stream threads for all cameras."""
    def __init__(self):
        self.workers: Dict[str, CameraStreamWorker] = {}

    def get_or_create_worker(
        self,
        camera_id: str,
        name: str,
        stream_url: str,
        stream_type: str = "webcam",
        sector: str = "Sector Alpha",
        virtual_fence: Optional[Any] = None
    ) -> CameraStreamWorker:
        if camera_id in self.workers and self.workers[camera_id].is_alive():
            return self.workers[camera_id]
            
        worker = CameraStreamWorker(
            camera_id=camera_id,
            name=name,
            stream_url=stream_url,
            stream_type=stream_type,
            sector=sector,
            virtual_fence=virtual_fence
        )
        worker.start()
        self.workers[camera_id] = worker
        return worker

    def stop_worker(self, camera_id: str):
        if camera_id in self.workers:
            self.workers[camera_id].stop()
            del self.workers[camera_id]

stream_manager = StreamManager()
