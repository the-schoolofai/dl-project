import io
import logging
import time
from pathlib import Path
from threading import Lock

import numpy as np
from PIL import Image, UnidentifiedImageError

from app.inference.base import Prediction, Predictor

logger = logging.getLogger(__name__)


class KerasImageClassifier(Predictor):
    name = "rps_cnn.keras"

    def __init__(
        self,
        model_path: Path,
        class_names: list[str],
        image_size: tuple[int, int],
    ) -> None:
        self.model_path = Path(model_path)
        self.classes = list(class_names)
        self.image_size = image_size
        self._model = None
        self._lock = Lock()

    @property
    def is_ready(self) -> bool:
        return self._model is not None

    def load(self) -> None:
        if self.is_ready:
            return
        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Model artifact not found at {self.model_path}"
            )

        import keras

        logger.info("Loading Keras model from %s", self.model_path)
        self._model = keras.models.load_model(self.model_path)
        logger.info("Keras model loaded; classes=%s", self.classes)

    def _preprocess(self, image_bytes: bytes) -> np.ndarray:
        try:
            img = Image.open(io.BytesIO(image_bytes))
        except UnidentifiedImageError as exc:
            raise ValueError("Uploaded file is not a valid image") from exc

        img = img.convert("RGB").resize(self.image_size, Image.Resampling.BILINEAR)
        arr = np.asarray(img, dtype=np.float32)
        return np.expand_dims(arr, axis=0)

    def predict(self, image_bytes: bytes) -> Prediction:
        if not self.is_ready:
            raise RuntimeError("Model is not loaded")

        batch = self._preprocess(image_bytes)

        with self._lock:
            start = time.perf_counter()
            probs = self._model.predict(batch, verbose=0)[0]
            elapsed_ms = (time.perf_counter() - start) * 1000.0

        probs = np.asarray(probs, dtype=np.float64)
        if probs.shape[0] != len(self.classes):
            raise RuntimeError(
                f"Model output size {probs.shape[0]} does not match "
                f"class list of size {len(self.classes)}"
            )

        top_idx = int(np.argmax(probs))
        return Prediction(
            label=self.classes[top_idx],
            confidence=float(probs[top_idx]),
            probabilities={c: float(p) for c, p in zip(self.classes, probs)},
            inference_ms=elapsed_ms,
        )
