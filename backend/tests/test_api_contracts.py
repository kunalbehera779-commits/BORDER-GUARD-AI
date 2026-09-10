from __future__ import annotations

import asyncio

from fastapi.testclient import TestClient

from app.main import app
from app.services.websocket_manager import ConnectionManager


def test_health_endpoint():
    with TestClient(app) as client:
        response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_camera_creation_and_listing():
    with TestClient(app) as client:
        camera_id = "TEST-CAM-API"
        response = client.post("/api/cameras", json={"id": camera_id, "name": "Test Camera"})
        assert response.status_code == 201
        cameras = client.get("/api/cameras").json()
    assert any(camera["id"] == camera_id for camera in cameras)


def test_detection_schema_rejects_missing_required_fields():
    with TestClient(app) as client:
        response = client.post("/api/detection-events", json={"id": "bad"})
    assert response.status_code == 422


class FakeWebSocket:
    def __init__(self):
        self.messages = []

    async def send_json(self, message):
        self.messages.append(message)


def test_websocket_message_structure():
    manager = ConnectionManager()
    websocket = FakeWebSocket()
    manager._connections.append(websocket)
    asyncio.run(manager.broadcast("new_alert", {"event_id": "EVT-1"}))
    assert websocket.messages == [{"type": "new_alert", "payload": {"event_id": "EVT-1"}}]
