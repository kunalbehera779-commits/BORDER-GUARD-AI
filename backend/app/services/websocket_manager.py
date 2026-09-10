from __future__ import annotations

import logging
from typing import Any

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self) -> None:
        self._connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections.append(websocket)
        logger.info("WebSocket connected", extra={"connections": len(self._connections)})

    def disconnect(self, websocket: WebSocket) -> None:
        if websocket in self._connections:
            self._connections.remove(websocket)
        logger.info("WebSocket disconnected", extra={"connections": len(self._connections)})

    async def broadcast(self, message_type: str, payload: dict[str, Any]) -> None:
        message = {"type": message_type, "payload": payload}
        disconnected: list[WebSocket] = []
        for websocket in self._connections:
            try:
                await websocket.send_json(message)
            except Exception:
                disconnected.append(websocket)
        for websocket in disconnected:
            self.disconnect(websocket)


manager = ConnectionManager()
