import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "storage"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)
(STORAGE_DIR / "snapshots").mkdir(parents=True, exist_ok=True)
(STORAGE_DIR / "clips").mkdir(parents=True, exist_ok=True)
(STORAGE_DIR / "models").mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    PROJECT_NAME: str = "BORDER-GUARD AI Command Center"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = f"sqlite:///{STORAGE_DIR}/border_guard.db"
    
    # Security
    JWT_SECRET_KEY: str = "border_guard_super_secret_key_change_in_production_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Storage
    STORAGE_PATH: Path = STORAGE_DIR
    SNAPSHOTS_PATH: Path = STORAGE_DIR / "snapshots"
    CLIPS_PATH: Path = STORAGE_DIR / "clips"
    MODELS_PATH: Path = STORAGE_DIR / "models"
    
    # YOLO & Inference
    YOLO_MODEL_NAME: str = "yolov8n.pt"  # Will auto-download if not present
    CONFIDENCE_THRESHOLD: float = 0.45
    IOU_THRESHOLD: float = 0.45
    TARGET_CLASSES: list[int] = [0, 1, 2, 3, 5, 7]  # person, bicycle, car, motorcycle, bus, truck
    
    # Video Streaming
    MAX_STREAM_FPS: int = 25
    FRAME_BUFFER_SIZE: int = 10
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
