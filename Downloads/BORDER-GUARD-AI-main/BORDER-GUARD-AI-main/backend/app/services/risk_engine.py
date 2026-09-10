import time
import uuid
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.event import AlertEvent

CLASS_RISK_WEIGHTS = {
    "person": 40.0,
    "car": 25.0,
    "truck": 30.0,
    "motorcycle": 30.0,
    "bus": 35.0,
    "drone": 75.0,
    "weapon": 95.0,
    "default": 20.0
}

class RiskEngine:
    def __init__(self, cooldown_seconds: float = 10.0):
        self.cooldown_seconds = cooldown_seconds
        # Stores track_id -> last_alert_timestamp
        self.last_alert_times: Dict[int, float] = {}

    def calculate_risk_score(self, detections: List[Dict[str, Any]]) -> float:
        """
        Calculates composite threat risk score (0.0 to 100.0) for the current camera frame.
        """
        if not detections:
            return 10.0 # Baseline ambient safety score
            
        max_base_risk = 0.0
        fence_intruders_count = 0
        total_dwell_bonus = 0.0

        for det in detections:
            cls_name = det.get("class_name", "default").lower()
            base_w = CLASS_RISK_WEIGHTS.get(cls_name, CLASS_RISK_WEIGHTS["default"])
            
            inside = det.get("inside_fence", False)
            if inside:
                fence_intruders_count += 1
                base_w += 35.0 # Intrusion bonus
                dwell = det.get("dwell_seconds", 0.0)
                total_dwell_bonus += min(30.0, dwell * 2.0)
                
            if base_w > max_base_risk:
                max_base_risk = base_w

        # Density factor (Multiple simultaneous targets)
        density_multiplier = 1.0 + (min(len(detections) - 1, 5) * 0.1)
        
        composite_score = (max_base_risk + total_dwell_bonus) * density_multiplier
        return min(100.0, round(composite_score, 1))

    def evaluate_and_alert(
        self,
        camera_id: str,
        camera_name: str,
        sector: str,
        detections: List[Dict[str, Any]],
        risk_score: float,
        fence_config: Any = None
    ) -> List[Dict[str, Any]]:
        """
        Evaluates detections and generates database alerts when high threats are triggered.
        Returns a list of created alert dicts.
        """
        if risk_score < 45.0 or not detections:
            return []

        now = time.time()
        created_alerts = []
        
        # Determine severity category
        severity = "low"
        if risk_score >= 85.0:
            severity = "critical"
        elif risk_score >= 65.0:
            severity = "high"
        elif risk_score >= 45.0:
            severity = "medium"

        db: Session = SessionLocal()
        try:
            for det in detections:
                inside = det.get("inside_fence", False)
                cls_name = det.get("class_name", "entity")
                track_id = det.get("track_id")
                
                # Only trigger alert if inside fence OR severity is high/critical
                if inside or severity in ["high", "critical"]:
                    if track_id is not None:
                        last_time = self.last_alert_times.get(track_id, 0.0)
                        if now - last_time < self.cooldown_seconds:
                            continue
                        self.last_alert_times[track_id] = now
                    
                    event_type = "Perimeter Intrusion" if inside else f"Unusual {cls_name.capitalize()} Activity"
                    title = f"{severity.upper()}: {event_type} at {camera_name}"
                    alert_id = f"ALT-{uuid.uuid4().hex[:6].upper()}"
                    
                    new_alert = AlertEvent(
                        id=alert_id,
                        camera_id=camera_id,
                        camera_name=camera_name,
                        sector=sector,
                        title=title,
                        event_type=event_type,
                        severity=severity,
                        risk_score=risk_score,
                        status="open",
                        bbox=str(det.get("bbox", [])),
                        track_id=track_id,
                        details=f"Target {cls_name} detected. Dwell time: {det.get('dwell_seconds', 0.0)}s."
                    )
                    db.add(new_alert)
                    
                    # Auto-log Incident response ticket for high/critical events or breaches
                    if severity in ["high", "critical"] or inside:
                        from app.models.incident import Incident
                        inc_id = f"INC-{uuid.uuid4().hex[:6].upper()}"
                        new_inc = Incident(
                            id=inc_id,
                            title=f"Incident: {event_type} at {camera_name}",
                            sector=sector,
                            camera_id=camera_id,
                            event_type=event_type,
                            severity=severity,
                            status="open",
                            assigned_team="Alpha Quick Response Tactical Unit",
                            notes=f"Auto-logged security incident. Threat risk index: {risk_score}/100."
                        )
                        db.add(new_inc)
                    
                    db.commit()
                    
                    created_alerts.append({
                        "id": alert_id,
                        "camera_id": camera_id,
                        "camera_name": camera_name,
                        "sector": sector,
                        "title": title,
                        "event_type": event_type,
                        "severity": severity,
                        "risk_score": risk_score,
                        "status": "open",
                        "timestamp": new_alert.timestamp.isoformat()
                    })
        except Exception as e:
            print(f"[Risk Engine] Alert DB Exception: {e}")
            db.rollback()
        finally:
            db.close()

        return created_alerts
