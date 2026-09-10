import cv2
import numpy as np
import json
from typing import List, Dict, Any, Tuple

# Distinct color palette for target classes
CLASS_COLORS = {
    "person": (0, 165, 255),       # Orange
    "car": (255, 191, 0),          # Cyan / Blue-Green
    "truck": (255, 144, 30),       # Deep Sky Blue
    "motorcycle": (255, 105, 180), # Hot Pink
    "bus": (238, 130, 238),        # Violet
    "drone": (0, 0, 255),          # Red
    "weapon": (0, 0, 255),         # Bright Red
    "default": (0, 255, 0)         # Green
}

def draw_annotations(
    frame: np.ndarray,
    detections: List[Dict[str, Any]],
    fence_data: Any = None,
    risk_score: float = 0.0,
    camera_name: str = "CAM-101"
) -> np.ndarray:
    """
    Renders bounding boxes, track IDs, polygon virtual fences, tripwire lines, and threat risk HUD.
    """
    annotated = frame.copy()
    h, w = annotated.shape[:2]
    
    # 1. Draw Virtual Fence Polygons & Lines if present
    if fence_data:
        try:
            points = fence_data if isinstance(fence_data, list) else json.loads(fence_data)
            if isinstance(points, list) and len(points) >= 3:
                poly_pts = np.array([[int(p.get("x", 0)), int(p.get("y", 0))] for p in points], np.int32)
                poly_pts = poly_pts.reshape((-1, 1, 2))
                
                # Semi-transparent overlay polygon
                overlay = annotated.copy()
                cv2.fillPoly(overlay, [poly_pts], (0, 0, 200)) # Translucent red restricted zone
                cv2.addWeighted(overlay, 0.25, annotated, 0.75, 0, annotated)
                
                # Perimeter line boundary
                cv2.polylines(annotated, [poly_pts], isClosed=True, color=(0, 0, 255), thickness=2, lineType=cv2.LINE_AA)
                cv2.putText(annotated, "VIRTUAL FENCE - KEEP OUT", (points[0]["x"] + 10, points[0]["y"] + 25),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        except Exception:
            pass

    # 2. Draw Detections & Bounding Boxes
    for det in detections:
        bbox = det.get("bbox", [0, 0, 0, 0])
        x1, y1, x2, y2 = [int(v) for v in bbox]
        class_name = det.get("class_name", "object")
        conf = det.get("confidence", 0.0)
        track_id = det.get("track_id")
        inside_fence = det.get("inside_fence", False)
        
        color = (0, 0, 255) if inside_fence else CLASS_COLORS.get(class_name, CLASS_COLORS["default"])
        
        # Draw bounding box
        cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2, cv2.LINE_AA)
        
        # Label formatting
        label = f"{class_name.upper()}"
        if track_id is not None:
            label += f" #{track_id}"
        label += f" {int(conf * 100)}%"
        if inside_fence:
            label += " [INTRUSION]"
            
        (txt_w, txt_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(annotated, (x1, max(0, y1 - txt_h - 6)), (x1 + txt_w + 6, max(0, y1)), color, -1)
        cv2.putText(annotated, label, (x1 + 3, max(0, y1 - 4)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)

    # 3. Render Top HUD Bar (Risk Engine & Camera Title)
    cv2.rectangle(annotated, (0, 0), (w, 40), (15, 15, 15), -1)
    
    # Camera Title & Timestamp
    cv2.putText(annotated, f"LIVE FEED: {camera_name.upper()}", (15, 26),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2, cv2.LINE_AA)
    
    # Risk Score Meter
    risk_color = (0, 255, 0) if risk_score < 35 else (0, 165, 255) if risk_score < 65 else (0, 0, 255)
    cv2.putText(annotated, f"THREAT RISK: {int(risk_score)}/100", (w - 230, 26),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, risk_color, 2, cv2.LINE_AA)
                
    # Risk gauge bar
    bar_w = 100
    bar_fill = int((risk_score / 100.0) * bar_w)
    cv2.rectangle(annotated, (w - 110, 12), (w - 10, 28), (50, 50, 50), -1)
    if bar_fill > 0:
        cv2.rectangle(annotated, (w - 110, 12), (w - 110 + bar_fill, 28), risk_color, -1)
    cv2.rectangle(annotated, (w - 110, 12), (w - 10, 28), (200, 200, 200), 1)

    return annotated
