import pytest

from backend.app.services.file_validation import (
    InvalidImageError,
    validate_image_content,
    validate_image_upload,
)
from backend.app.services.image_pipeline import prepare_image_for_inference


VALID_PNG = bytes.fromhex(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489"
    "0000000d49444154789c63f8cfc0f01f00050001ff89993d1d"
    "0000000049454e44ae426082"
)


def test_accepts_supported_image_metadata() -> None:
    validate_image_upload("sample.png", "image/png", 1024)


def test_accepts_real_png_content() -> None:
    validate_image_content(VALID_PNG, "image/png")


def test_prepare_image_returns_canonical_tensor_shape() -> None:
    tensor = prepare_image_for_inference(
        filename="sample.png",
        content_type="image/png",
        content=VALID_PNG,
    )
    assert tensor.shape == (224, 224, 3)
    assert tensor.dtype.str == "<f4"
    # MobileNetV2 preprocess_input maps RGB [0, 255] into approximately [-1, 1].
    assert -1.0 <= float(tensor.min()) <= float(tensor.max()) <= 1.0


def test_accepts_generic_binary_mime_when_extension_and_bytes_match() -> None:
    tensor = prepare_image_for_inference(
        filename="micrograph.png",
        content_type="application/octet-stream",
        content=VALID_PNG,
    )
    assert tensor.shape == (224, 224, 3)


def test_accepts_missing_mime_when_png_magic_bytes_match() -> None:
    tensor = prepare_image_for_inference(
        filename="micrograph.png",
        content_type=None,
        content=VALID_PNG,
    )
    assert tensor.shape == (224, 224, 3)


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
