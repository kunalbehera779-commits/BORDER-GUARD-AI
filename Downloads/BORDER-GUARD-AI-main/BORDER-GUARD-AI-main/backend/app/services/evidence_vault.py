import os
import cv2
import uuid
import datetime
import numpy as np
from typing import Optional
from app.config import settings
from app.database import SessionLocal
from app.models.evidence import EvidenceItem

class EvidenceVaultService:
    def __init__(self):
        settings.SNAPSHOTS_PATH.mkdir(parents=True, exist_ok=True)
        settings.CLIPS_PATH.mkdir(parents=True, exist_ok=True)

    def save_snapshot(self, frame: np.ndarray, camera_id: str, alert_id: Optional[str] = None) -> Optional[str]:
        """
        Saves a JPEG snapshot to disk and logs record to evidence_items database table.
        """
        if frame is None or frame.size == 0:
            return None

        filename = f"snap_{camera_id}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:4]}.jpg"
        filepath = settings.SNAPSHOTS_PATH / filename

        try:
            cv2.imwrite(str(filepath), frame)
            rel_url = f"/static/snapshots/{filename}"

            db = SessionLocal()
            evidence = EvidenceItem(
                id=f"EVD-{uuid.uuid4().hex[:6].upper()}",
                alert_id=alert_id,
                camera_id=camera_id,
                title=f"Incident Snapshot ({camera_id})",
                media_type="snapshot",
                file_path=rel_url,
                file_size_bytes=os.path.getsize(filepath) if filepath.exists() else 0
            )
            db.add(evidence)
            db.commit()
            db.close()

            return rel_url
        except Exception as e:
            print(f"[Evidence Vault] Failed to save snapshot: {e}")
            return None

evidence_vault = EvidenceVaultService()
