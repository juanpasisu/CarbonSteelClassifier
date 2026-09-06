"""Supabase Storage and database operations for user-owned images."""

from __future__ import annotations

import re
from pathlib import PurePosixPath
from typing import Any
from uuid import uuid4

from ..core.config import get_settings
from ..core.security import get_supabase_admin_client


class ImageStorageError(RuntimeError):
    """Raised when an image cannot be stored consistently."""


def _safe_file_name(file_name: str) -> str:
    """Return a short, path-safe display name while preserving its extension."""

    base_name = file_name.replace("\\", "/").rsplit("/", maxsplit=1)[-1].strip()
    base_name = re.sub(r"[^A-Za-z0-9._-]", "_", base_name)
    base_name = base_name.strip("._")
    return (base_name or "image")[:180]


def _storage_path(user_id: str, file_name: str) -> tuple[str, str]:
    """Create a unique user-scoped Storage path and safe display name."""

    safe_name = _safe_file_name(file_name)
    extension = PurePosixPath(safe_name).suffix.lower()
    object_name = f"{uuid4()}{extension}"
    return f"{user_id}/{object_name}", safe_name


def upload_user_image(
    *,
    user_id: str,
    file_name: str,
    content: bytes,
    content_type: str,
) -> dict[str, Any]:
    """Upload an image and persist its metadata for the authenticated user."""

    settings = get_settings()
    storage_path, safe_name = _storage_path(user_id, file_name)
    client = get_supabase_admin_client()
    bucket = client.storage.from_(settings.supabase_storage_bucket)

    try:
        bucket.upload(
            storage_path,
            content,
            file_options={"content-type": content_type, "upsert": "false"},
        )
        result = (
            client.table("images")
            .insert(
                {
                    "user_id": user_id,
                    "file_name": safe_name,
                    "storage_path": storage_path,
                    "file_size": len(content),
                    "mime_type": content_type,
                }
            )
            .execute()
        )
    except Exception as error:  # noqa: BLE001 - normalize provider failures.
        try:
            bucket.remove([storage_path])
        except Exception:
            pass
        raise ImageStorageError("The image could not be stored") from error

    rows = getattr(result, "data", None)
    if not isinstance(rows, list) or not rows or not isinstance(rows[0], dict):
        try:
            bucket.remove([storage_path])
        except Exception:
            pass
        raise ImageStorageError("The image metadata could not be persisted")

    return rows[0]


def list_user_images(user_id: str) -> list[dict[str, Any]]:
    """Return image metadata owned by the authenticated user."""

    settings = get_settings()
    result = (
        get_supabase_admin_client()
        .table("images")
        .select("id,file_name,storage_path,file_size,mime_type,created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    rows = getattr(result, "data", None)
    if not isinstance(rows, list):
        raise ImageStorageError(
            f"Could not read images from {settings.supabase_storage_bucket}"
        )
    return [row for row in rows if isinstance(row, dict)]
