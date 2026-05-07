import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.core.config import Settings, get_settings
from app.schemas.predict import ClassProbability, PredictionResponse
from app.services import PredictionService
from app.api.deps import get_prediction_service


logger = logging.getLogger(__name__)

router = APIRouter(tags=["inference"])


def _validate_upload(file: UploadFile, settings: Settings) -> None:
    if file.content_type not in settings.allowed_content_types:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"Unsupported content type '{file.content_type}'. "
                f"Allowed: {sorted(settings.allowed_content_types)}"
            ),
        )


async def _read_capped(file: UploadFile, max_bytes: int) -> bytes:
    data = await file.read(max_bytes + 1)
    if len(data) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds {max_bytes} bytes limit",
        )
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty",
        )
    return data


@router.post("/predict", response_model=PredictionResponse, summary="Classify a single image")
async def predict(
    file: UploadFile = File(..., description="Image file (jpg, png, webp, bmp)"),
    service: PredictionService = Depends(get_prediction_service),
    settings: Settings = Depends(get_settings),
) -> PredictionResponse:
    if not service.is_ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model is not loaded",
        )

    _validate_upload(file, settings)
    image_bytes = await _read_capped(file, settings.max_upload_bytes)

    try:
        result = service.predict(image_bytes)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
    except Exception:
        logger.exception("Inference failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Inference failed",
        )

    sorted_probs = sorted(
        result.probabilities.items(), key=lambda kv: kv[1], reverse=True
    )
    return PredictionResponse(
        label=result.label,
        confidence=result.confidence,
        probabilities=[
            ClassProbability(label=k, probability=v) for k, v in sorted_probs
        ],
        model_name=service.model_name,
        inference_ms=result.inference_ms,
    )
