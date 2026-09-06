"""Schemas for microstructure catalog responses."""

from pydantic import BaseModel


class MicrostructureClassResponse(BaseModel):
    """Public representation of a supported microstructure class."""

    slug: str
    name: str
    scientific_description: str
