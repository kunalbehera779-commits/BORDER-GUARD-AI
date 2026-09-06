from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.alerts import router as alerts_router
from app.api.routes.cameras import router as cameras_router
from app.api.routes.detection_events import router as detection_events_router
from app.api.routes.health import router as health_router
from app.api.routes.incidents import router as incidents_router
from app.core.config import settings
from app.db.database import Base, engine

app = FastAPI(title=settings.app_name, version="0.1.0", debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(cameras_router, prefix="/api")
app.include_router(alerts_router, prefix="/api")
app.include_router(incidents_router, prefix="/api")
app.include_router(detection_events_router, prefix="/api")


@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "BORDER-GUARD-AI API is running"}
