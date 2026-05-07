from fastapi import Request

from app.services import PredictionService


def get_prediction_service(request: Request) -> PredictionService:
    service = getattr(request.app.state, "prediction_service", None)
    if service is None:
        raise RuntimeError("PredictionService is not initialised on app.state")
    return service
