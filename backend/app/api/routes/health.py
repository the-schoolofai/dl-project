from fastapi import APIRouter, Depends

from app.schemas.predict import HealthResponse
from app.services import PredictionService
from app.api.deps import get_prediction_service


router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def health(
    service: PredictionService = Depends(get_prediction_service),
) -> HealthResponse:
    return HealthResponse(
        status="ok" if service.is_ready else "degraded",
        model_loaded=service.is_ready,
        model_name=service.model_name,
        classes=service.classes,
    )
