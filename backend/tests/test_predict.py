import io
from unittest.mock import MagicMock

from fastapi.testclient import TestClient
from PIL import Image

from app.inference.base import Prediction
from app.main import create_app


def _png_bytes(size: tuple[int, int] = (150, 150)) -> bytes:
    img = Image.new("RGB", size, color=(255, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def _client(prediction: Prediction | None = None, is_ready: bool = True) -> TestClient:
    app = create_app()
    stub = MagicMock()
    stub.is_ready = is_ready
    stub.model_name = "rps_cnn.keras"
    stub.classes = ["paper", "rock", "scissors"]
    if prediction is not None:
        stub.predict.return_value = prediction
    app.state.prediction_service = stub
    return TestClient(app)


def test_predict_success():
    pred = Prediction(
        label="paper",
        confidence=0.9,
        probabilities={"paper": 0.9, "rock": 0.07, "scissors": 0.03},
        inference_ms=12.5,
    )
    client = _client(pred)
    res = client.post(
        "/api/v1/predict",
        files={"file": ("img.png", _png_bytes(), "image/png")},
    )
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["label"] == "paper"
    assert body["confidence"] == 0.9
    assert body["probabilities"][0]["label"] == "paper"
    assert body["model_name"] == "rps_cnn.keras"


def test_predict_unsupported_content_type():
    client = _client(Prediction("paper", 1.0, {"paper": 1.0}, 1.0))
    res = client.post(
        "/api/v1/predict",
        files={"file": ("img.gif", b"x", "image/gif")},
    )
    assert res.status_code == 415


def test_predict_empty_file():
    client = _client(Prediction("paper", 1.0, {"paper": 1.0}, 1.0))
    res = client.post(
        "/api/v1/predict",
        files={"file": ("img.png", b"", "image/png")},
    )
    assert res.status_code == 400


def test_predict_model_not_loaded():
    client = _client(is_ready=False)
    res = client.post(
        "/api/v1/predict",
        files={"file": ("img.png", _png_bytes(), "image/png")},
    )
    assert res.status_code == 503


def test_predict_batch():
    pred = Prediction("rock", 0.8, {"rock": 0.8, "paper": 0.1, "scissors": 0.1}, 5.0)
    client = _client(pred)
    img = _png_bytes()
    res = client.post(
        "/api/v1/predict/batch",
        files=[
            ("files", ("a.png", img, "image/png")),
            ("files", ("b.png", img, "image/png")),
        ],
    )
    assert res.status_code == 200, res.text
    body = res.json()
    assert len(body) == 2
    assert all(item["label"] == "rock" for item in body)
