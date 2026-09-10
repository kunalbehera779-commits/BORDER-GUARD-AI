from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "BORDER-GUARD-AI"
    debug: bool = False
    database_url: str = "sqlite:///./border_guard_ai.db"
    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    yolo_model_path: str = "yolo11n.pt"
    detection_confidence: float = 0.25
    detection_iou: float = 0.45
    processing_fps: float = 5.0
    evidence_dir: str = "./evidence"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


settings = Settings()
