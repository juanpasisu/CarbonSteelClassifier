"""Validation rules for image uploads."""

from __future__ import annotations

from io import BytesIO
from pathlib import Path

from PIL import Image, UnidentifiedImageError


MAX_IMAGE_SIZE_BYTES = 25 * 1024 * 1024
ALLOWED_IMAGE_TYPES = frozenset(
    {"image/jpeg", "image/png", "image/webp", "image/tiff"}
)
ALLOWED_IMAGE_EXTENSIONS = frozenset(
    {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"}
)


class InvalidImageError(ValueError):
    """Raised when an upload does not satisfy image constraints."""


def validate_image_upload(
    filename: str | None,
    content_type: str | None,
    file_size: int,
) -> None:
    """Validate image metadata before reading or storing the file."""

    if not filename or not Path(filename).name:
        raise InvalidImageError("A filename is required")

    if content_type not in ALLOWED_IMAGE_TYPES:
        raise InvalidImageError("Unsupported image MIME type")

    if Path(filename).suffix.lower() not in ALLOWED_IMAGE_EXTENSIONS:
        raise InvalidImageError("Unsupported image extension")

    if file_size <= 0 or file_size > MAX_IMAGE_SIZE_BYTES:
        raise InvalidImageError("Image size must be between 1 byte and 25 MB")


def validate_image_content(content: bytes, content_type: str) -> None:
    """Verify that bytes contain a readable image matching its MIME type."""

    format_to_mime = {
        "JPEG": "image/jpeg",
        "PNG": "image/png",
        "WEBP": "image/webp",
        "TIFF": "image/tiff",
    }

    try:
        with Image.open(BytesIO(content)) as image:
            detected_mime = format_to_mime.get((image.format or "").upper())
            image.verify()
    except (
        Image.DecompressionBombError,
        Image.DecompressionBombWarning,
        OSError,
        UnidentifiedImageError,
        ValueError,
    ) as error:
        raise InvalidImageError("The uploaded file is not a valid image") from error

    if detected_mime != content_type:
        raise InvalidImageError("Image content does not match its MIME type")
