import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import Base, engine, SessionLocal
from app.api.v1 import api_router
from app.websockets.stream_manager import router as ws_stream_router
from app.websockets.alert_manager import router as ws_alert_router
from app.models import Camera, AlertEvent, Incident, User
from app.utils.security import get_password_hash

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static storage directory for snapshot/clip downloads
app.mount("/static", StaticFiles(directory=str(settings.STORAGE_PATH)), name="static")

# Include REST Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

# Include WebSocket Routers
app.include_router(ws_stream_router, prefix="/ws")
app.include_router(ws_alert_router, prefix="/ws")

@app.on_event("startup")
def startup_event():
    """Seed default admin user if database is empty."""
    db = SessionLocal()
    try:
        # Seed default admin user
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            db.add(User(
                username="admin",
                email="admin@borderguard.ai",
                hashed_password=get_password_hash("admin123"),
                role="admin"
            ))
        db.commit()
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "docs_url": "/docs"
    }
