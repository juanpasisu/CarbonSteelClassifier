"""Schemas for authenticated image uploads."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ImageResponse(BaseModel):
    """Metadata for an image owned by the authenticated user."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    file_name: str
    storage_path: str
    file_size: int
    mime_type: str
    created_at: datetime
