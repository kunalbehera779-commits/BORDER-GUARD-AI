import numpy as np
from typing import List, Dict, Any

class SimpleTracker:
    """
    Lightweight Centroid & IoU Object Tracker for persistent tracking IDs across video frames.
    """
    def __init__(self, max_disappeared: int = 15, iou_threshold: float = 0.3):
        self.next_object_id = 1
        self.objects: Dict[int, List[float]] = {}  # id -> [x1, y1, x2, y2]
        self.disappeared: Dict[int, int] = {}     # id -> count
        self.max_disappeared = max_disappeared
        self.iou_threshold = iou_threshold

    def _iou(self, boxA: List[float], boxB: List[float]) -> float:
        xA = max(boxA[0], boxB[0])
        yA = max(boxA[1], boxB[1])
        xB = min(boxA[2], boxB[2])
        yB = min(boxA[3], boxB[3])
        interArea = max(0, xB - xA) * max(0, yB - yA)
        boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
        boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])
        iou = interArea / float(boxAArea + boxBArea - interArea + 1e-6)
        return iou

    def update(self, detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not detections:
            for object_id in list(self.disappeared.keys()):
                self.disappeared[object_id] += 1
                if self.disappeared[object_id] > self.max_disappeared:
                    del self.objects[object_id]
                    del self.disappeared[object_id]
            return []

        input_boxes = [d["bbox"] for d in detections]

        if not self.objects:
            for i, det in enumerate(detections):
                self.objects[self.next_object_id] = input_boxes[i]
                self.disappeared[self.next_object_id] = 0
                det["track_id"] = self.next_object_id
                self.next_object_id += 1
            return detections

        # Compute IoU matrix
        object_ids = list(self.objects.keys())
        existing_boxes = list(self.objects.values())

        iou_matrix = np.zeros((len(existing_boxes), len(input_boxes)))
        for i, eb in enumerate(existing_boxes):
            for j, ib in enumerate(input_boxes):
                iou_matrix[i, j] = self._iou(eb, ib)

        # Match using greedy maximum IoU
        matched_existing = set()
        matched_input = set()

        while True:
            if iou_matrix.size == 0:
                break
            max_idx = np.unravel_index(np.argmax(iou_matrix), iou_matrix.shape)
            max_val = iou_matrix[max_idx]

            if max_val < self.iou_threshold:
                break

            e_idx, i_idx = max_idx
            if e_idx in matched_existing or i_idx in matched_input:
                iou_matrix[e_idx, i_idx] = -1
                continue

            matched_existing.add(e_idx)
            matched_input.add(i_idx)

            obj_id = object_ids[e_idx]
            self.objects[obj_id] = input_boxes[i_idx]
            self.disappeared[obj_id] = 0
            detections[i_idx]["track_id"] = obj_id

            iou_matrix[e_idx, :] = -1
            iou_matrix[:, i_idx] = -1

        # Register new objects
        for i, det in enumerate(detections):
            if i not in matched_input:
                self.objects[self.next_object_id] = input_boxes[i]
                self.disappeared[self.next_object_id] = 0
                det["track_id"] = self.next_object_id
                self.next_object_id += 1

        # Increment disappeared for unmatched existing objects
        for i, obj_id in enumerate(object_ids):
            if i not in matched_existing:
                self.disappeared[obj_id] += 1
                if self.disappeared[obj_id] > self.max_disappeared:
                    del self.objects[obj_id]
                    del self.disappeared[obj_id]

        return detections
