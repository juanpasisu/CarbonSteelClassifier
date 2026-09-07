"""Supabase admin client for backend-only operations."""

from __future__ import annotations

from functools import lru_cache
from typing import Any

from fastapi import HTTPException, status

from .config import get_settings


class SupabaseNotConfiguredError(RuntimeError):
    """Raised when Supabase credentials are missing."""


@lru_cache
def get_supabase_admin_client() -> Any:
    """Create the backend-only Supabase client using the service-role key."""

    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise SupabaseNotConfiguredError(
            "Supabase backend integration is not configured."
        )

    try:
        from supabase import create_client

        return create_client(
            settings.supabase_url,
            settings.supabase_service_role_key,
        )
    except SupabaseNotConfiguredError:
        raise
    except Exception as error:  # noqa: BLE001 - convert SDK setup errors.
        raise RuntimeError("Supabase backend integration is unavailable.") from error


def require_supabase_admin_client() -> Any:
    """Return the admin client or raise an HTTP 503 for API routes."""

    try:
        return get_supabase_admin_client()
    except (SupabaseNotConfiguredError, RuntimeError) as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error),
        ) from error


def try_get_supabase_admin_client() -> Any | None:
    """Return the admin client when configured, otherwise ``None``."""

    try:
        return get_supabase_admin_client()
    except (SupabaseNotConfiguredError, RuntimeError):
        return None
