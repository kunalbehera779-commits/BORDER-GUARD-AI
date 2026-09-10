import time
import json
from typing import List, Dict, Any, Tuple, Optional
from shapely.geometry import Point, Polygon

class VirtualFenceEngine:
    def __init__(self):
        # Stores track_id -> entry_timestamp (in seconds)
        self.track_entry_times: Dict[int, float] = {}

    def is_inside_polygon(self, point: Tuple[float, float], polygon_points: List[Dict[str, float]]) -> bool:
        """
        Ray-casting / Shapely algorithm to check if point (x, y) is inside fence polygon.
        """
        if not polygon_points or len(polygon_points) < 3:
            return False
            
        try:
            poly_coords = [(p.get("x", 0.0), p.get("y", 0.0)) for p in polygon_points]
            poly = Polygon(poly_coords)
            pt = Point(point[0], point[1])
            return poly.contains(pt) or poly.touches(pt)
        except Exception:
            return False

    def process_detections(
        self,
        detections: List[Dict[str, Any]],
        fence_config: Optional[Any]
    ) -> List[Dict[str, Any]]:
        """
        Evaluates detections against virtual fence polygons & calculates loitering dwell times.
        """
        if not fence_config:
            return detections
            
        polygon_points = fence_config if isinstance(fence_config, list) else []
        if isinstance(fence_config, str):
            try:
                polygon_points = json.loads(fence_config)
            except Exception:
                polygon_points = []

        now = time.time()
        current_track_ids = set()

        for det in detections:
            bbox = det.get("bbox", [0, 0, 0, 0])
            # Center-bottom of bounding box (footprint of target)
            center_x = (bbox[0] + bbox[2]) / 2.0
            bottom_y = bbox[3]
            
            inside = self.is_inside_polygon((center_x, bottom_y), polygon_points)
            det["inside_fence"] = inside
            
            track_id = det.get("track_id")
            if track_id is not None:
                current_track_ids.add(track_id)
                if inside:
                    if track_id not in self.track_entry_times:
                        self.track_entry_times[track_id] = now
                    dwell_sec = round(now - self.track_entry_times[track_id], 1)
                    det["dwell_seconds"] = dwell_sec
                else:
                    self.track_entry_times.pop(track_id, None)
                    det["dwell_seconds"] = 0.0

        # Cleanup stale track IDs
        stale = [tid for tid in self.track_entry_times if tid not in current_track_ids]
        for tid in stale:
            self.track_entry_times.pop(tid, None)

        return detections
