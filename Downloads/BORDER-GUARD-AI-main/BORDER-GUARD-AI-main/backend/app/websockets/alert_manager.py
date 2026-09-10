import asyncio
import json
from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

class AlertConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"[WebSocket Alerts] New client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"[WebSocket Alerts] Client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast_alert(self, alert_data: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(alert_data)
            except Exception:
                self.disconnect(connection)

alert_notifier = AlertConnectionManager()

def broadcast_alert_sync(alert_data: dict):
    if not alert_notifier.active_connections:
        return
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            asyncio.run_coroutine_threadsafe(alert_notifier.broadcast_alert(alert_data), loop)
        else:
            loop.run_until_complete(alert_notifier.broadcast_alert(alert_data))
    except Exception:
        try:
            new_loop = asyncio.new_event_loop()
            new_loop.run_until_complete(alert_notifier.broadcast_alert(alert_data))
            new_loop.close()
        except Exception:
            pass

@router.websocket("/alerts")
async def websocket_alerts_endpoint(websocket: WebSocket):
    await alert_notifier.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        alert_notifier.disconnect(websocket)
    except Exception:
        alert_notifier.disconnect(websocket)
