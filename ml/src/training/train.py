"""Train the microstructure CNN with TensorFlow/Keras MobileNetV2."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

from tensorflow import keras

from ml.src.config.classes import get_class_registry
from ml.src.config.settings import (
    DATASET_CONFIG,
    DEFAULT_CHECKPOINT_DIR,
    DEFAULT_DATASET_DIR,
    DEFAULT_TRAINED_DIR,
    TRAINING_CONFIG,
)
from ml.src.data.index import build_image_index, split_by_source_group
from ml.src.evaluation.metrics import build_metrics_report, collect_predictions
from ml.src.models.cnn import (
    build_mobilenet_v2_classifier,
    compile_model,
    set_global_seed,
)
from ml.src.training.dataset import (
    build_tf_dataset,
    class_names,
    compute_class_weights,
    records_to_arrays,
)


def save_label_metadata(output_dir: Path) -> None:
    """Persist the exact class order used by the trained model."""

    registry = get_class_registry()
    payload = {
        "ordering": "official_training_order",
        "classes": [
            {
                "index": index,
                "slug": item["slug"],
                "name": item["name"],
            }
            for index, item in enumerate(registry)
        ],
    }
    (output_dir / "labels.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    (output_dir / "class_names.json").write_text(
        json.dumps([str(item["name"]) for item in registry], ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def export_active_model(
    model: keras.Model,
    output_dir: Path,
    metrics: dict[str, Any],
    training_summary: dict[str, Any],
) -> Path:
    """Write the production ``.keras`` artifact expected by FastAPI."""

    output_dir.mkdir(parents=True, exist_ok=True)
    model_path = output_dir / "active.keras"
    model.save(model_path)
    save_label_metadata(output_dir)
    (output_dir / "metrics.json").write_text(
        json.dumps({"metrics": metrics, "training": training_summary}, indent=2),
        encoding="utf-8",
    )
    return model_path


def train(
    *,
    dataset_dir: Path = DEFAULT_DATASET_DIR,
    output_dir: Path = DEFAULT_TRAINED_DIR,
    checkpoint_dir: Path = DEFAULT_CHECKPOINT_DIR,
    epochs: int = TRAINING_CONFIG.epochs,
    batch_size: int = DATASET_CONFIG.batch_size,
    seed: int = DATASET_CONFIG.seed,
) -> dict[str, Any]:
    """Train the classification head on a frozen MobileNetV2 base and export it."""

    set_global_seed(seed)
    checkpoint_dir.mkdir(parents=True, exist_ok=True)
    output_dir.mkdir(parents=True, exist_ok=True)

    records = build_image_index(dataset_dir)
    if not records:
        raise RuntimeError(f"No training images found under {dataset_dir}")

    partitions = split_by_source_group(records, seed=seed)
    names = class_names()
    num_classes = len(names)
    if num_classes != 7:
        raise RuntimeError(f"Expected 7 classes, found {num_classes}")

    train_ds = build_tf_dataset(
        partitions["train"],
        batch_size=batch_size,
        shuffle=True,
        augment=True,
        seed=seed,
    )
    val_ds = build_tf_dataset(
        partitions["validation"],
        batch_size=batch_size,
        shuffle=False,
        augment=False,
        seed=seed,
    )

    class_weight = compute_class_weights(partitions["train"])
    model = build_mobilenet_v2_classifier(
        num_classes=num_classes,
        image_size=DATASET_CONFIG.image_size,
        trainable_base=False,
    )
    compile_model(model, learning_rate=TRAINING_CONFIG.learning_rate)

    checkpoint_path = checkpoint_dir / "best_head.keras"
    head_callbacks = [
        keras.callbacks.EarlyStopping(
            monitor="val_accuracy",
            patience=TRAINING_CONFIG.early_stopping_patience,
            restore_best_weights=True,
        ),
        keras.callbacks.ModelCheckpoint(
            filepath=str(checkpoint_path),
            monitor="val_accuracy",
            save_best_only=True,
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=2,
            min_lr=1e-6,
        ),
    ]

    head_history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs,
        class_weight=class_weight,
        callbacks=head_callbacks,
        verbose=2,
    )

    test_images, test_labels = records_to_arrays(partitions["test"])
    y_true, y_pred, _probabilities = collect_predictions(
        model,
        test_images,
        test_labels,
        batch_size=batch_size,
    )
    metrics = build_metrics_report(y_true, y_pred, names)

    def _history_to_list(history: keras.callbacks.History) -> list[dict[str, float]]:
        keys = list(history.history)
        length = len(history.history[keys[0]]) if keys else 0
        rows: list[dict[str, float]] = []
        for index in range(length):
            rows.append(
                {key: float(history.history[key][index]) for key in keys}
                | {"epoch": float(index + 1)}
            )
        return rows

    training_summary = {
        "framework": "tensorflow",
        "keras": keras.__version__,
        "backbone": "mobilenet_v2",
        "seed": seed,
        "batch_size": batch_size,
        "epochs_head": epochs,
        "selected_checkpoint": "best_head",
        "best_val_accuracy": float(max(head_history.history.get("val_accuracy", [0.0]))),
        "partition_sizes": {
            name: len(partition_records)
            for name, partition_records in partitions.items()
        },
        "class_weights": class_weight,
        "history_head": _history_to_list(head_history),
        "image_size": list(DATASET_CONFIG.image_size),
        "preprocessing": "mobilenet_v2.preprocess_input",
        "split": {
            "train": 1.0 - DATASET_CONFIG.validation_split - DATASET_CONFIG.test_split,
            "validation": DATASET_CONFIG.validation_split,
            "test": DATASET_CONFIG.test_split,
            "strategy": "source_group",
        },
        "augmentation": {
            "mode": "joint",
            "operations": [
                "horizontal_and_vertical_flip",
                "rotation",
                "zoom",
                "translation",
                "brightness",
                "contrast",
            ],
        },
    }

    model_path = export_active_model(model, output_dir, metrics, training_summary)
    print(
        json.dumps({"model_path": str(model_path), "test_metrics": metrics}, indent=2),
        flush=True,
    )
    return {"model_path": model_path, "metrics": metrics, "training": training_summary}


def main() -> int:
    """CLI entrypoint for model training."""

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dataset-dir", type=Path, default=DEFAULT_DATASET_DIR)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_TRAINED_DIR)
    parser.add_argument("--checkpoint-dir", type=Path, default=DEFAULT_CHECKPOINT_DIR)
    parser.add_argument("--epochs", type=int, default=TRAINING_CONFIG.epochs)
    parser.add_argument("--batch-size", type=int, default=DATASET_CONFIG.batch_size)
    parser.add_argument("--seed", type=int, default=DATASET_CONFIG.seed)
    args = parser.parse_args()

    train(
        dataset_dir=args.dataset_dir,
        output_dir=args.output_dir,
        checkpoint_dir=args.checkpoint_dir,
        epochs=args.epochs,
        batch_size=args.batch_size,
        seed=args.seed,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
