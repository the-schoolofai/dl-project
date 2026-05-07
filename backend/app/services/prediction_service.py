import logging

from app.core.config import Settings
from app.inference import KerasImageClassifier, Prediction, Predictor

logger = logging.getLogger(__name__)


class PredictionService:
    def __init__(self, predictor: Predictor) -> None:
        self._predictor = predictor

    @classmethod
    def from_settings(cls, settings: Settings) -> "PredictionService":
        predictor = KerasImageClassifier(
            model_path=settings.model_path,
            class_names=settings.class_names,
            image_size=settings.image_size,
        )
        return cls(predictor)

    def warmup(self) -> None:
        self._predictor.load()

    @property
    def predictor(self) -> Predictor:
        return self._predictor

    @property
    def is_ready(self) -> bool:
        return self._predictor.is_ready

    @property
    def model_name(self) -> str:
        return self._predictor.name

    @property
    def classes(self) -> list[str]:
        return self._predictor.classes

    def predict(self, image_bytes: bytes) -> Prediction:
        return self._predictor.predict(image_bytes)
