from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.websocket_manager import manager

router = APIRouter(tags=["websocket"])


@router.websocket("/api/ws")
async def surveillance_websocket(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
