"""TensorFlow dataset adapters over the group-aware image index."""

from __future__ import annotations

from collections.abc import Sequence

import numpy as np
import tensorflow as tf

from ml.src.config.classes import get_class_registry
from ml.src.config.settings import DATASET_CONFIG
from ml.src.data.index import ImageRecord
from ml.src.preprocessing.image import load_and_preprocess_image


def class_slug_to_index() -> dict[str, int]:
    """Map canonical class slugs to contiguous training indices."""

    return {item["slug"]: index for index, item in enumerate(get_class_registry())}


def class_names() -> list[str]:
    """Return display names in the canonical training/inference order."""

    return [str(item["name"]) for item in get_class_registry()]


def records_to_arrays(
    records: Sequence[ImageRecord],
) -> tuple[np.ndarray, np.ndarray]:
    """Materialize preprocessed images and integer labels."""

    slug_to_index = class_slug_to_index()
    images = np.stack([load_and_preprocess_image(record.path) for record in records])
    labels = np.asarray(
        [slug_to_index[record.class_slug] for record in records],
        dtype=np.int32,
    )
    return images, labels


def build_tf_dataset(
    records: Sequence[ImageRecord],
    *,
    batch_size: int = DATASET_CONFIG.batch_size,
    shuffle: bool = False,
    augment: bool = False,
    seed: int = DATASET_CONFIG.seed,
) -> tf.data.Dataset:
    """Build a ``tf.data.Dataset`` for one partition."""

    images, labels = records_to_arrays(records)
    dataset = tf.data.Dataset.from_tensor_slices((images, labels))
    if shuffle:
        dataset = dataset.shuffle(
            buffer_size=len(records),
            seed=seed,
            reshuffle_each_iteration=True,
        )

    if augment:
        augmenter = tf.keras.Sequential(
            [
                tf.keras.layers.RandomFlip("horizontal_and_vertical"),
                tf.keras.layers.RandomRotation(0.08),
                tf.keras.layers.RandomZoom(0.08),
                tf.keras.layers.RandomTranslation(0.05, 0.05),
            ],
            name="train_augmenter",
        )

        def _augment(image: tf.Tensor, label: tf.Tensor) -> tuple[tf.Tensor, tf.Tensor]:
            return augmenter(image, training=True), label

        dataset = dataset.map(_augment, num_parallel_calls=tf.data.AUTOTUNE)

    return dataset.batch(batch_size).prefetch(tf.data.AUTOTUNE)


def compute_class_weights(records: Sequence[ImageRecord]) -> dict[int, float]:
    """Inverse-frequency weights for mild class imbalance."""

    slug_to_index = class_slug_to_index()
    counts = np.zeros(len(slug_to_index), dtype=np.float64)
    for record in records:
        counts[slug_to_index[record.class_slug]] += 1.0
    counts = np.maximum(counts, 1.0)
    weights = counts.sum() / (len(counts) * counts)
    return {index: float(weights[index]) for index in range(len(weights))}
