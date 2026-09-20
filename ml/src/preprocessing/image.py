"""Image decoding and MobileNetV2-compatible preprocessing.

Training and FastAPI inference must call the same functions so that
``mobilenet_v2.preprocess_input`` is never applied twice or skipped.
"""

from __future__ import annotations

from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

from ml.src.config.settings import DATASET_CONFIG


def decode_rgb_image(
    image: Image.Image,
    image_size: tuple[int, int] = DATASET_CONFIG.image_size,
) -> np.ndarray:
    """Return an RGB float32 array in ``[0, 255]`` with shape ``(H, W, 3)``."""

    prepared = ImageOps.exif_transpose(image).convert("RGB")
    prepared = prepared.resize(image_size, Image.Resampling.LANCZOS)
    array = np.asarray(prepared, dtype=np.float32)

    expected_shape = (image_size[1], image_size[0], 3)
    if array.shape != expected_shape:
        raise ValueError(f"Unexpected image shape {array.shape}; expected {expected_shape}")
    return array


def apply_mobilenet_preprocessing(array_0_255: np.ndarray) -> np.ndarray:
    """Apply MobileNetV2 ``preprocess_input`` to an RGB ``[0, 255]`` array."""

    return preprocess_input(array_0_255.copy())


def preprocess_pil_image(
    image: Image.Image,
    image_size: tuple[int, int] = DATASET_CONFIG.image_size,
) -> np.ndarray:
    """Decode, resize and apply MobileNetV2 preprocessing."""

    return apply_mobilenet_preprocessing(decode_rgb_image(image, image_size=image_size))


def preprocess_image_bytes(
    content: bytes,
    image_size: tuple[int, int] = DATASET_CONFIG.image_size,
) -> np.ndarray:
    """Decode image bytes and apply the shared preprocessing pipeline."""

    try:
        with Image.open(BytesIO(content)) as image:
            return preprocess_pil_image(image, image_size=image_size)
    except (OSError, SyntaxError, UnidentifiedImageError, ValueError) as error:
        raise ValueError("The uploaded file could not be preprocessed") from error


def load_rgb_image(
    image_path: Path,
    image_size: tuple[int, int] = DATASET_CONFIG.image_size,
) -> np.ndarray:
    """Decode an image file to RGB ``[0, 255]`` without MobileNet normalization."""

    with Image.open(image_path) as image:
        return decode_rgb_image(image, image_size=image_size)


def load_and_preprocess_image(
    image_path: Path,
    image_size: tuple[int, int] = DATASET_CONFIG.image_size,
) -> np.ndarray:
    """Decode an image file and apply the shared preprocessing pipeline."""

    return apply_mobilenet_preprocessing(load_rgb_image(image_path, image_size=image_size))


def is_readable_image(image_path: Path) -> bool:
    """Return whether Pillow can fully verify the image without changing it."""

    try:
        with Image.open(image_path) as image:
            image.verify()
    except (OSError, SyntaxError):
        return False
    return True
