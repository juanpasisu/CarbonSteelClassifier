"""Resume TensorFlow training from best_head.keras and export active.keras."""

from __future__ import annotations

import json
from pathlib import Path

from tensorflow import keras

from ml.src.config.settings import (
    DATASET_CONFIG,
    DEFAULT_CHECKPOINT_DIR,
    DEFAULT_DATASET_DIR,
    DEFAULT_TRAINED_DIR,
    TRAINING_CONFIG,
)
from ml.src.data.index import build_image_index, split_by_source_group
from ml.src.evaluation.metrics import build_metrics_report, collect_predictions
from ml.src.models.cnn import compile_model, set_global_seed, unfreeze_top_layers
from ml.src.training.dataset import (
    build_tf_dataset,
    class_names,
    compute_class_weights,
    records_to_arrays,
)
from ml.src.training.train import export_active_model


def main() -> int:
    set_global_seed(DATASET_CONFIG.seed)
    checkpoint_path = DEFAULT_CHECKPOINT_DIR / "best_head.keras"
    if not checkpoint_path.is_file():
        raise SystemExit(f"Missing checkpoint: {checkpoint_path}")

    records = build_image_index(DEFAULT_DATASET_DIR)
    partitions = split_by_source_group(records, seed=DATASET_CONFIG.seed)
    names = class_names()
    class_weight = compute_class_weights(partitions["train"])

    train_ds = build_tf_dataset(
        partitions["train"],
        batch_size=DATASET_CONFIG.batch_size,
        shuffle=True,
        augment=True,
        seed=DATASET_CONFIG.seed,
    )
    val_ds = build_tf_dataset(
        partitions["validation"],
        batch_size=DATASET_CONFIG.batch_size,
        shuffle=False,
        augment=False,
        seed=DATASET_CONFIG.seed,
    )

    model = keras.models.load_model(checkpoint_path)
    # Ensure base_model attribute exists for unfreeze helper.
    if not hasattr(model, "base_model"):
        for layer in model.layers:
            if layer.name.startswith("mobilenet"):
                model.base_model = layer
                break

    unfreeze_top_layers(model, layers_to_unfreeze=40)
    compile_model(model, learning_rate=TRAINING_CONFIG.fine_tune_learning_rate)

    fine_checkpoint = DEFAULT_CHECKPOINT_DIR / "best_finetune.keras"
    fine_history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=6,
        class_weight=class_weight,
        callbacks=[
            keras.callbacks.EarlyStopping(
                monitor="val_accuracy",
                patience=TRAINING_CONFIG.early_stopping_patience,
                restore_best_weights=True,
            ),
            keras.callbacks.ModelCheckpoint(
                filepath=str(fine_checkpoint),
                monitor="val_accuracy",
                save_best_only=True,
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor="val_loss",
                factor=0.5,
                patience=2,
                min_lr=1e-7,
            ),
        ],
        verbose=2,
    )

    test_images, test_labels = records_to_arrays(partitions["test"])
    y_true, y_pred, _ = collect_predictions(
        model,
        test_images,
        test_labels,
        batch_size=DATASET_CONFIG.batch_size,
    )
    metrics = build_metrics_report(y_true, y_pred, names)
    training_summary = {
        "framework": "tensorflow",
        "keras": keras.__version__,
        "backbone": "mobilenet_v2",
        "seed": DATASET_CONFIG.seed,
        "batch_size": DATASET_CONFIG.batch_size,
        "resumed_from": str(checkpoint_path),
        "epochs_finetune": 6,
        "best_val_accuracy": float(max(fine_history.history.get("val_accuracy", [0.0]))),
        "partition_sizes": {
            name: len(partition_records)
            for name, partition_records in partitions.items()
        },
        "class_weights": class_weight,
        "image_size": list(DATASET_CONFIG.image_size),
        "preprocessing": "mobilenet_v2.preprocess_input",
        "history_finetune": [
            {
                key: float(fine_history.history[key][index])
                for key in fine_history.history
            }
            | {"epoch": float(index + 1)}
            for index in range(len(next(iter(fine_history.history.values()))))
        ],
    }
    model_path = export_active_model(
        model,
        DEFAULT_TRAINED_DIR,
        metrics,
        training_summary,
    )
    print(json.dumps({"model_path": str(model_path), "test_metrics": metrics}, indent=2), flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
