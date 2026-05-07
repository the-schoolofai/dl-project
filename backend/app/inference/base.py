from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class Prediction:
    label: str
    confidence: float
    probabilities: dict[str, float]
    inference_ms: float


class Predictor(ABC):
    name: str
    classes: list[str]

    @abstractmethod
    def load(self) -> None:
        ...

    @abstractmethod
    def predict(self, image_bytes: bytes) -> Prediction:
        ...

    @property
    @abstractmethod
    def is_ready(self) -> bool:
        ...
