from fastapi import APIRouter
from app.api.v1.cameras import router as cameras_router
from app.api.v1.alerts import router as alerts_router
from app.api.v1.incidents import router as incidents_router
from app.api.v1.auth import router as auth_router
from app.api.v1.anpr import router as anpr_router
from app.api.v1.evidence import router as evidence_router

api_router = APIRouter()
api_router.include_router(cameras_router, prefix="/cameras", tags=["Cameras"])
api_router.include_router(alerts_router, prefix="/alerts", tags=["Alerts"])
api_router.include_router(incidents_router, prefix="/incidents", tags=["Incidents"])
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(anpr_router, prefix="/anpr", tags=["ANPR"])
api_router.include_router(evidence_router, prefix="/evidence", tags=["Evidence"])
