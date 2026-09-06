"""Authentication endpoints."""

from fastapi import APIRouter, Depends

from ...core.security import get_current_user
from ...schemas.auth import CurrentUserResponse


router = APIRouter(prefix="/auth", tags=["authentication"])


@router.get("/me", response_model=CurrentUserResponse)
def read_current_user(
    current_user: CurrentUserResponse = Depends(get_current_user),
) -> CurrentUserResponse:
    """Return the identity represented by the supplied Supabase JWT."""

    return current_user
