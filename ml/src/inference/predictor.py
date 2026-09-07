"""Load the trained Keras CNN and run single-image inference."""

from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import numpy as np
from tensorflow import keras

from ml.src.config.classes import get_class_registry
from ml.src.config.settings import DEFAULT_TRAINED_DIR, TRAINING_CONFIG
from ml.src.preprocessing.image import preprocess_image_bytes


@dataclass(frozen=True)
class PredictionResult:
    """Structured inference output aligned with the public API contract."""

    predicted_class: str
    confidence: float
    probabilities: list[dict[str, float | str]]
    model_name: str
    model_version: str
    framework: str = "TensorFlow/Keras"


class ModelNotFoundError(FileNotFoundError):
    """Raised when the active trained artifact is missing."""


def default_model_path() -> Path:
    """Return the canonical production model path."""

    return DEFAULT_TRAINED_DIR / "active.keras"


def load_class_names(model_dir: Path) -> list[str]:
    """Load class names from exported metadata, falling back to the registry."""

    class_names_path = model_dir / "class_names.json"
    labels_path = model_dir / "labels.json"
    if class_names_path.is_file():
        payload = json.loads(class_names_path.read_text(encoding="utf-8"))
        if isinstance(payload, list) and all(isinstance(item, str) for item in payload):
            return payload
    if labels_path.is_file():
        payload = json.loads(labels_path.read_text(encoding="utf-8"))
        classes = payload.get("classes", [])
        names = [str(item["name"]) for item in classes if isinstance(item, dict)]
        if names:
            return names
    return [str(item["name"]) for item in get_class_registry()]


@lru_cache
def load_predictor(model_path: str | None = None) -> "MicrostructurePredictor":
    """Cache a predictor instance for repeated API calls."""

    path = Path(model_path) if model_path else default_model_path()
    return MicrostructurePredictor.from_path(path)


class MicrostructurePredictor:
    """Inference helper that keeps training/inference preprocessing aligned."""

    def __init__(
        self,
        model: keras.Model,
        class_names: list[str],
        model_name: str,
        model_version: str,
    ) -> None:
        self.model = model
        self.class_names = class_names
        self.model_name = model_name
        self.model_version = model_version

    @classmethod
    def from_path(cls, model_path: Path) -> "MicrostructurePredictor":
        """Load a serialized Keras model and its label metadata."""

        if not model_path.is_file():
            raise ModelNotFoundError(f"Trained model not found at {model_path}")

        class_names = load_class_names(model_path.parent)
        registry_names = [str(item["name"]) for item in get_class_registry()]
        if class_names != registry_names:
            raise ValueError(
                "Checkpoint class order does not match shared/microstructure_classes.json"
            )
        if len(class_names) != 7:
            raise ValueError(f"Expected exactly 7 classes, found {len(class_names)}")

        model = keras.models.load_model(model_path)
        output_units = int(model.output_shape[-1])
        if output_units != 7:
            raise ValueError(f"Model output units={output_units}; expected 7")

        return cls(
            model=model,
            class_names=class_names,
            model_name=TRAINING_CONFIG.model_name,
            model_version=TRAINING_CONFIG.model_version,
        )

    def predict_bytes(self, content: bytes) -> PredictionResult:
        """Preprocess image bytes and return ranked class probabilities."""

        array = preprocess_image_bytes(content)
        batch = np.expand_dims(array, axis=0)
        probabilities = self.model.predict(batch, verbose=0)[0]

        if probabilities.shape[0] != 7:
            raise ValueError(
                f"Model returned {probabilities.shape[0]} probabilities; expected 7"
            )

        ranked_index = int(np.argmax(probabilities))
        probability_rows = [
            {
                "class": self.class_names[index],
                "probability": float(probabilities[index]),
            }
            for index in range(len(self.class_names))
        ]
        probability_rows.sort(
            key=lambda row: float(row["probability"]),
            reverse=True,
        )

        return PredictionResult(
            predicted_class=self.class_names[ranked_index],
            confidence=float(probabilities[ranked_index]),
            probabilities=probability_rows,
            model_name=self.model_name,
            model_version=self.model_version,
            framework="TensorFlow/Keras",
        )
