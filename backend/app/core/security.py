"""Supabase JWT authentication dependencies."""

from __future__ import annotations

from functools import lru_cache
from typing import Annotated, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from ..schemas.auth import CurrentUserResponse
from .config import get_settings


bearer_scheme = HTTPBearer(auto_error=False)


@lru_cache
def get_supabase_admin_client() -> Any:
    """Create the backend-only Supabase client using the service-role key."""

    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_service_role_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase backend integration is not configured.",
        )

    try:
        from supabase import create_client

        return create_client(
            settings.supabase_url,
            settings.supabase_service_role_key,
        )
    except HTTPException:
        raise
    except Exception as error:  # noqa: BLE001 - convert SDK setup errors.
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Supabase backend integration is unavailable.",
        ) from error


def _unauthorized() -> HTTPException:
    """Build a consistent response for missing or invalid bearer tokens."""

    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="A valid Supabase access token is required.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
) -> CurrentUserResponse:
    """Validate a Supabase JWT and return its authenticated user identity."""

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise _unauthorized()

    try:
        response = get_supabase_admin_client().auth.get_user(credentials.credentials)
    except HTTPException:
        raise
    except Exception as error:  # noqa: BLE001 - SDK errors mean invalid JWT.
        raise _unauthorized() from error

    user = getattr(response, "user", None)
    user_id = getattr(user, "id", None)
    if not user_id:
        raise _unauthorized()

    return CurrentUserResponse(
        id=str(user_id),
        email=getattr(user, "email", None),
    )
