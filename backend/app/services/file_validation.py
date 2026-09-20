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
_MIME_BY_EXTENSION = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".tif": "image/tiff",
    ".tiff": "image/tiff",
}
_MIME_ALIASES = {
    "image/jpg": "image/jpeg",
    "image/pjpeg": "image/jpeg",
    "image/x-png": "image/png",
    "image/x-tiff": "image/tiff",
    "image/tif": "image/tiff",
}
_GENERIC_BINARY_TYPES = frozenset(
    {"", "application/octet-stream", "binary/octet-stream"}
)


class InvalidImageError(ValueError):
    """Raised when an upload does not satisfy image constraints."""


def sniff_image_mime(content: bytes) -> str | None:
    """Return a canonical image MIME type from magic bytes, if recognized."""

    if content.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if content.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if len(content) >= 12 and content.startswith(b"RIFF") and content[8:12] == b"WEBP":
        return "image/webp"
    if content.startswith((b"II*\x00", b"MM\x00*")):
        return "image/tiff"
    return None


def resolve_image_content_type(
    filename: str | None,
    content_type: str | None,
    content: bytes | None = None,
) -> str:
    """Normalize browser/OS MIME types, including empty or generic binary types."""

    raw = (content_type or "").strip().lower()
    if raw in _MIME_ALIASES:
        return _MIME_ALIASES[raw]
    if raw in ALLOWED_IMAGE_TYPES:
        return raw

    suffix = Path(filename or "").suffix.lower()
    if raw in _GENERIC_BINARY_TYPES and suffix in _MIME_BY_EXTENSION:
        return _MIME_BY_EXTENSION[suffix]
    if content:
        sniffed = sniff_image_mime(content)
        if sniffed and (
            raw in _GENERIC_BINARY_TYPES or suffix in _MIME_BY_EXTENSION
        ):
            return sniffed
    if suffix in _MIME_BY_EXTENSION:
        return _MIME_BY_EXTENSION[suffix]
    return raw


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
