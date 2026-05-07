from unittest.mock import MagicMock

from fastapi.testclient import TestClient

from app.main import create_app


def _client_with_stub_service(is_ready: bool = True) -> TestClient:
    app = create_app()
    stub = MagicMock()
    stub.is_ready = is_ready
    stub.model_name = "rps_cnn.keras"
    stub.classes = ["paper", "rock", "scissors"]
    app.state.prediction_service = stub
    return TestClient(app)


def test_health_ok():
    client = _client_with_stub_service(is_ready=True)
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert body["model_loaded"] is True
    assert body["classes"] == ["paper", "rock", "scissors"]


def test_health_degraded_when_model_missing():
    client = _client_with_stub_service(is_ready=False)
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "degraded"
    assert body["model_loaded"] is False


def test_root():
    client = _client_with_stub_service()
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["api"] == "/api/v1"
