from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence

from app.services.tracker import TrackedDetection


@dataclass(frozen=True)
class ZoneDefinition:
    id: str
    camera_id: str
    name: str
    polygon: list[tuple[float, float]]
    zone_type: str = "monitored"
    enabled: bool = True


@dataclass(frozen=True)
class ZoneTransition:
    zone_id: str
    camera_id: str
    tracking_id: str
    object_type: str
    transition: str
    inside: bool
    zone_type: str
    timestamp_seconds: float


def point_in_polygon(point: tuple[float, float], polygon: Sequence[tuple[float, float]]) -> bool:
    x, y = point
    inside = False
    if len(polygon) < 3:
        return False
    previous_x, previous_y = polygon[-1]
    for current_x, current_y in polygon:
        crosses = (current_y > y) != (previous_y > y)
        if crosses and x < (previous_x - current_x) * (y - current_y) / (previous_y - current_y) + current_x:
            inside = not inside
        previous_x, previous_y = current_x, current_y
    return inside


class ZoneEngine:
    def __init__(self) -> None:
        self._states: dict[tuple[str, str], bool] = {}

    def evaluate(self, tracked: TrackedDetection, zone: ZoneDefinition) -> ZoneTransition | None:
        if not zone.enabled or tracked.detection.camera_id != zone.camera_id:
            return None
        x1, y1, x2, y2 = tracked.detection.bounding_box
        inside = point_in_polygon(((x1 + x2) / 2, (y1 + y2) / 2), zone.polygon)
        key = (zone.id, tracked.tracking_id)
        previous = self._states.get(key, False)
        self._states[key] = inside
        if inside == previous:
            return None
        return ZoneTransition(
            zone_id=zone.id,
            camera_id=zone.camera_id,
            tracking_id=tracked.tracking_id,
            object_type=tracked.detection.class_name,
            transition="entry" if inside else "exit",
            inside=inside,
            zone_type=zone.zone_type,
            timestamp_seconds=tracked.detection.timestamp_seconds,
        )
