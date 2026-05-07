# DL Image Classifier - Backend

FastAPI inference service for the Rock-Paper-Scissors Keras CNN (TensorFlow)
(`artifacts/rps_cnn.keras`).

## Layout

```
backend/
├── app/
│   ├── main.py                     FastAPI app + lifespan (model warmup)
│   ├── core/config.py              Settings (env-driven)
│   ├── schemas/predict.py          Pydantic request/response models
│   ├── inference/
│   │   ├── base.py                 Predictor abstract base + Prediction dataclass
│   │   └── keras_classifier.py     Keras CNN inference (PIL preprocessing)
│   ├── services/
│   │   └── prediction_service.py   Wires settings -> predictor
│   └── api/
│       ├── deps.py                 FastAPI dependencies
│       └── routes/
│           ├── health.py           GET  /api/v1/health
│           └── predict.py          POST /api/v1/predict
├── artifacts/rps_cnn.keras         Trained Keras CNN (150×150×3 -> 3 classes)
├── tests/                          Pytest suite
├── Dockerfile
└── requirements.txt
```

## Run locally

```bash
cd backend
uv run fastapi dev app/main.py
```

Open http://localhost:8000/docs for the OpenAPI UI.

## Configuration

All settings come from env vars prefixed with `APP_` (or a `.env` file):

| variable             | default                              |
|----------------------|--------------------------------------|
| `APP_MODEL_PATH`     | `backend/artifacts/rps_cnn.keras`    |
| `APP_IMAGE_SIZE`     | `[150, 150]`                         |
| `APP_CLASS_NAMES`    | `["paper", "rock", "scissors"]`      |
| `APP_API_PREFIX`     | `/api/v1`                            |
| `APP_CORS_ORIGINS`   | `["*"]`                              |
| `APP_MAX_UPLOAD_BYTES` | `8388608` (8 MiB)                  |

## Endpoints

### `GET /api/v1/health`
```json
{
  "status": "ok",
  "model_loaded": true,
  "model_name": "rps_cnn.keras",
  "classes": ["paper", "rock", "scissors"]
}
```

### `POST /api/v1/predict`
Multipart form: `file=<image>` (jpg/png/webp/bmp).

```bash
curl -F "file=@paper01-000.png" http://localhost:8000/api/v1/predict
```

Response:
```json
{
  "label": "paper",
  "confidence": 0.997,
  "probabilities": [
    {"label": "paper", "probability": 0.997},
    {"label": "rock",  "probability": 0.002},
    {"label": "scissors","probability": 0.001}
  ],
  "model_name": "rps_cnn.keras",
  "inference_ms": 24.7
}
```

## Docker

```bash
docker build -t dl-backend ./backend
docker run --rm -p 8000:8000 dl-backend
```

## Tests

```bash
pytest backend/tests
```
