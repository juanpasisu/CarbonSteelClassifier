"""Evaluate the active model on an external ASTM-prepared hold-out set.

Images under ``ml/data/external/`` must not appear in the training dataset.
They are intended to come from UIS metallography lab samples prepared per
ASTM E3 (specimen preparation) and ASTM E407 (etching), then photographed
with optical microscopy — the external validation described in the work plan.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from ml.src.config.settings import (
    DATASET_CONFIG,
    DEFAULT_DATASET_DIR,
    DEFAULT_EXTERNAL_DIR,
    DEFAULT_TRAINED_DIR,
)
from ml.src.data.index import ImageRecord, build_image_index
from ml.src.evaluation.metrics import build_metrics_report, collect_predictions
from ml.src.inference.predictor import default_model_path
from ml.src.training.dataset import class_names, records_to_arrays


PROTOCOL = {
    "preparation": "ASTM E3",
    "etching": "ASTM E407",
    "microscopy": "optical",
    "purpose": "external_validation_not_used_in_train_val_test",
}


def _record_key(record: ImageRecord) -> tuple[str, str]:
    return record.class_slug, record.source_group


def assert_no_source_overlap(
    external: list[ImageRecord],
    training_pool: list[ImageRecord],
) -> None:
    """Reject the run if an external image shares a source with the dataset."""

    training_keys = {_record_key(record) for record in training_pool}
    leaked = sorted(
        {
            f"{record.class_slug}/{record.source_group}"
            for record in external
            if _record_key(record) in training_keys
        }
    )
    if leaked:
        raise ValueError(
            "External set overlaps the training dataset: " + ", ".join(leaked)
        )


def evaluate_external(
    *,
    external_dir: Path = DEFAULT_EXTERNAL_DIR,
    dataset_dir: Path = DEFAULT_DATASET_DIR,
    model_path: Path | None = None,
    output_path: Path | None = None,
    batch_size: int = DATASET_CONFIG.batch_size,
) -> dict[str, Any]:
    """Run the production CNN on the external folder and write a JSON report."""

    from tensorflow import keras

    external_records = build_image_index(external_dir)
    if not external_records:
        raise RuntimeError(
            f"No external validation images found under {external_dir}. "
            "Add ASTM E3/E407 micrographs in the same class-folder layout as ml/data/raw/."
        )

    training_pool = build_image_index(dataset_dir)
    assert_no_source_overlap(external_records, training_pool)

    resolved_model = model_path or default_model_path()
    if not resolved_model.is_file():
        raise FileNotFoundError(f"Trained model not found at {resolved_model}")

    model = keras.models.load_model(resolved_model)
    images, labels = records_to_arrays(external_records)
    names = class_names()
    y_true, y_pred, _probabilities = collect_predictions(
        model,
        images,
        labels,
        batch_size=batch_size,
    )
    metrics = build_metrics_report(y_true, y_pred, names)
    report: dict[str, Any] = {
        "protocol": PROTOCOL,
        "external_dir": str(external_dir),
        "model_path": str(resolved_model),
        "image_count": len(external_records),
        "metrics": metrics,
    }
    destination = output_path or (DEFAULT_TRAINED_DIR / "external_metrics.json")
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({"output": str(destination), "metrics": metrics}, indent=2), flush=True)
    return report


def main() -> int:
    """CLI entrypoint for external validation."""

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--external-dir", type=Path, default=DEFAULT_EXTERNAL_DIR)
    parser.add_argument("--dataset-dir", type=Path, default=DEFAULT_DATASET_DIR)
    parser.add_argument("--model-path", type=Path, default=None)
    parser.add_argument("--output", type=Path, default=None)
    parser.add_argument("--batch-size", type=int, default=DATASET_CONFIG.batch_size)
    args = parser.parse_args()
    evaluate_external(
        external_dir=args.external_dir,
        dataset_dir=args.dataset_dir,
        model_path=args.model_path,
        output_path=args.output,
        batch_size=args.batch_size,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
