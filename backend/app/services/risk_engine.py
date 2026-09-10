from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.services.environment import EnvironmentContext
from app.services.zone_engine import ZoneTransition


@dataclass(frozen=True)
class RiskEvent:
    event_type: str
    severity: str
    risk_score: float
    reason: str
    camera_id: str
    zone_id: str | None
    timestamp_seconds: float
    environment_context: dict[str, Any]
    object_type: str
    tracking_id: str


class RiskEngine:
    def evaluate(self, transition: ZoneTransition, confidence: float, environment: EnvironmentContext) -> RiskEvent | None:
        if transition.transition != "entry":
            return None
        base = {
            "restricted": ("possible intrusion", "high", 0.85),
            "monitored": ("unauthorized-zone event", "medium", 0.55),
            "safe": ("authorized-zone observation", "low", 0.2),
        }
        event_type, severity, base_score = base.get(transition.zone_type, base["monitored"])
        if transition.object_type == "drone" and transition.zone_type == "restricted":
            event_type, severity, base_score = "restricted-airspace observation", "critical", 0.95
        elif transition.object_type == "animal":
            event_type, severity, base_score = "animal entered monitored area", "low", 0.25
        elif transition.object_type in {"car", "truck", "bus", "motorcycle"}:
            event_type, severity, base_score = "unknown vehicle in zone", "medium", 0.6
        risk_score = round(min(1.0, base_score * environment.confidence_factor * max(confidence, 0.0)), 3)
        return RiskEvent(
            event_type=event_type,
            severity=severity,
            risk_score=risk_score,
            reason=f"{transition.object_type} crossed into {transition.zone_id} ({transition.transition})",
            camera_id=transition.camera_id,
            zone_id=transition.zone_id,
            timestamp_seconds=transition.timestamp_seconds,
            environment_context=environment.as_dict(),
            object_type=transition.object_type,
            tracking_id=transition.tracking_id,
        )
