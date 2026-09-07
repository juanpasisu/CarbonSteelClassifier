"""In-memory image preparation for public prediction requests."""

from __future__ import annotations

import numpy as np

from ml.src.preprocessing.image import preprocess_image_bytes

from .file_validation import (
    InvalidImageError,
    validate_image_content,
    validate_image_upload,
)


def prepare_image_for_inference(
    *,
    filename: str | None,
    content_type: str | None,
    content: bytes,
) -> np.ndarray:
    """Validate upload metadata/content and return a preprocessed tensor.

    The resulting array lives only in process memory for the request lifetime.
    """

    try:
        validate_image_upload(filename, content_type, len(content))
        validate_image_content(content, content_type or "")
        return preprocess_image_bytes(content)
    except InvalidImageError:
        raise
    except ValueError as error:
        raise InvalidImageError(str(error)) from error
