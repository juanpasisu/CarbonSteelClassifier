import pytest

from backend.app.services.file_validation import (
    InvalidImageError,
    validate_image_content,
    validate_image_upload,
)



VALID_PNG = bytes.fromhex(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489"
    "0000000d49444154789c6360f8cf00000004000101f9"
    "0000000049454e44ae426082"
)


def test_accepts_supported_image_metadata() -> None:
    validate_image_upload("sample.png", "image/png", 1024)


def test_accepts_real_png_content() -> None:
    validate_image_content(VALID_PNG, "image/png")


def test_rejects_fake_image_content() -> None:
    with pytest.raises(InvalidImageError):
        validate_image_content(b"not-an-image", "image/png")


@pytest.mark.parametrize(
    ("filename", "content_type", "file_size"),
    [
        ("sample.exe", "application/octet-stream", 1024),
        ("sample.png", "image/png", 0),
        ("sample.png", "image/png", 26 * 1024 * 1024),
    ],
)
def test_rejects_invalid_image_metadata(
    filename: str,
    content_type: str,
    file_size: int,
) -> None:
    with pytest.raises(InvalidImageError):
        validate_image_upload(filename, content_type, file_size)
