"""Evaluation helpers for the microstructure classifier."""

from __future__ import annotations

from typing import Any

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)
from tensorflow import keras


def collect_predictions(
    model: keras.Model,
    images: np.ndarray,
    labels: np.ndarray,
    *,
    batch_size: int = 32,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Return labels, predicted indices and softmax probabilities."""

    probabilities = model.predict(images, batch_size=batch_size, verbose=0)
    predictions = np.argmax(probabilities, axis=1).astype(np.int64)
    return labels.astype(np.int64), predictions, probabilities.astype(np.float64)


def build_metrics_report(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    class_names: list[str],
) -> dict[str, Any]:
    """Build a JSON-serializable evaluation summary."""

    report = classification_report(
        y_true,
        y_pred,
        target_names=class_names,
        output_dict=True,
        zero_division=0,
    )
    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "macro_f1": float(f1_score(y_true, y_pred, average="macro", zero_division=0)),
        "weighted_f1": float(
            f1_score(y_true, y_pred, average="weighted", zero_division=0)
        ),
        "classification_report": report,
        "confusion_matrix": confusion_matrix(y_true, y_pred).tolist(),
        "class_names": class_names,
    }
