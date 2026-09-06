"""Authenticated image upload endpoints."""

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from ...core.security import get_current_user
from ...schemas.auth import CurrentUserResponse
from ...schemas.image import ImageResponse
from ...services.file_validation import (
    MAX_IMAGE_SIZE_BYTES,
    InvalidImageError,
    validate_image_content,
    validate_image_upload,
)
from ...services.image_storage import (
    ImageStorageError,
    list_user_images,
    upload_user_image,
)


router = APIRouter(prefix="/images", tags=["images"])


@router.get("", response_model=list[ImageResponse])
def read_user_images(
    current_user: CurrentUserResponse = Depends(get_current_user),
) -> list[ImageResponse]:
    """List image metadata belonging to the authenticated user."""

    try:
        return [ImageResponse(**row) for row in list_user_images(current_user.id)]
    except ImageStorageError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The image history is temporarily unavailable.",
        ) from error


@router.post("", response_model=ImageResponse, status_code=status.HTTP_201_CREATED)
def create_user_image(
    file: UploadFile = File(...),
    current_user: CurrentUserResponse = Depends(get_current_user),
) -> ImageResponse:
    """Validate, store, and register one image for the authenticated user."""

    content = file.file.read(MAX_IMAGE_SIZE_BYTES + 1)
    try:
        validate_image_upload(file.filename, file.content_type, len(content))
        validate_image_content(content, file.content_type or "")
    except InvalidImageError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    try:
        row = upload_user_image(
            user_id=current_user.id,
            file_name=file.filename or "image",
            content=content,
            content_type=file.content_type or "",
        )
        return ImageResponse(**row)
    except ImageStorageError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The image could not be stored.",
        ) from error
