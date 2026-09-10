from pathlib import Path

from fastapi import APIRouter, HTTPException, Query

from app.services.video_ingestion import OpenCVVideoSource, VideoSourceError

router = APIRouter(tags=["video"])


@router.get("/video/metadata")
def video_metadata(path: str = Query(..., min_length=1)):
    try:
        metadata = OpenCVVideoSource(Path(path)).metadata()
    except VideoSourceError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return metadata.__dict__
