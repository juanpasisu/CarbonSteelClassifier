"""Image decoding and normalization shared by training and inference."""

from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

from ml.src.config.settings import DATASET_CONFIG


def load_and_preprocess_image(
    image_path: Path,
    image_size: tuple[int, int] = DATASET_CONFIG.image_size,
) -> np.ndarray:
    """Decode an image, convert it to RGB, resize it and normalize to [0, 1]."""

    with Image.open(image_path) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        image = image.resize(image_size, Image.Resampling.LANCZOS)
        array = np.asarray(image, dtype=np.float32) / 255.0

    if array.shape != (image_size[1], image_size[0], 3):
        raise ValueError(f"Unexpected image shape {array.shape} for {image_path}")

    return array


def is_readable_image(image_path: Path) -> bool:
    """Return whether Pillow can fully verify the image without changing it."""

    try:
        with Image.open(image_path) as image:
            image.verify()
    except (OSError, SyntaxError):
        return False
    return True
