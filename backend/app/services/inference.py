"""Inference service boundary for the active CNN."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from ..core.config import get_settings
from ..schemas.prediction import (
    ClassProbability,
    ModelInfo,
    ModelStatusResponse,
    PhasePresence,
    PredictResponse,
)


class ModelUnavailableError(RuntimeError):
    """Raised when the trained model cannot be loaded for inference."""


class InferenceError(RuntimeError):
    """Raised when inference fails after the model was loaded."""


def _resolve_model_path() -> Path:
    settings = get_settings()
    configured = Path(settings.model_path)
    if configured.is_file():
        return configured

    project_root = Path(__file__).resolve().parents[3]
    candidates = [
        project_root / settings.model_path,
        project_root / "ml" / "models" / "trained" / "active.keras",
        Path.cwd() / settings.model_path,
    ]
    for candidate in candidates:
        if candidate.is_file():
            return candidate
    return configured


@lru_cache
def _load_predictor():
    """Lazy-load the ML predictor so the API can start without a model."""

    from ml.src.inference.predictor import (
        MicrostructurePredictor,
        ModelNotFoundError,
    )

    model_path = _resolve_model_path()
    try:
        return MicrostructurePredictor.from_path(model_path)
    except ModelNotFoundError as error:
        raise ModelUnavailableError(str(error)) from error
    except Exception as error:  # noqa: BLE001 - surface load failures cleanly.
        raise ModelUnavailableError(
            "The trained CNN could not be loaded."
        ) from error


def get_model_status() -> ModelStatusResponse:
    """Return whether a trained model artifact is present and ready."""

    model_path = _resolve_model_path()
    if not model_path.is_file():
        return ModelStatusResponse(
            available=False,
            detail="The trained CNN is not available yet.",
        )

    try:
        predictor = _load_predictor()
    except ModelUnavailableError as error:
        return ModelStatusResponse(available=False, detail=str(error))

    return ModelStatusResponse(
        available=True,
        name=predictor.model_name,
        version=predictor.model_version,
        detail="Model loaded and ready for inference.",
    )


def require_model_ready() -> ModelStatusResponse:
    """Ensure a model is available before accepting prediction requests."""

    status = get_model_status()
    if not status.available:
        raise ModelUnavailableError(
            status.detail or "The trained CNN is not available yet."
        )
    return status


def predict_image_bytes(content: bytes) -> PredictResponse:
    """Run CNN inference on validated image bytes."""

    try:
        predictor = _load_predictor()
        result = predictor.predict_bytes(content)
    except ModelUnavailableError:
        raise
    except Exception as error:  # noqa: BLE001 - keep API errors user-safe.
        raise InferenceError("The image could not be analyzed.") from error

    return PredictResponse(
        predicted_class=result.predicted_class,
        confidence=result.confidence,
        probabilities=[
            ClassProbability(
                class_name=str(item["class"]),
                probability=float(item["probability"]),
            )
            for item in result.probabilities
        ],
        identified_phases=[
            PhasePresence(
                slug=str(item["slug"]),
                name=str(item["name"]),
                present=bool(item["present"]),
            )
            for item in result.identified_phases
        ],
        model=ModelInfo(
            name=result.model_name,
            version=result.model_version,
            framework=result.framework,
        ),
    )


def clear_predictor_cache() -> None:
    """Drop the cached predictor (useful for tests)."""

    _load_predictor.cache_clear()
