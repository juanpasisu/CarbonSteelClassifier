"""Authentication response schemas."""

from pydantic import BaseModel


class CurrentUserResponse(BaseModel):
    """Minimal authenticated-user representation returned by the API."""

    id: str
    email: str | None = None
