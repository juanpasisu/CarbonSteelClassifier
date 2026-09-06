"""Microstructure class catalog endpoints."""

from fastapi import APIRouter

from ...core.microstructures import get_microstructure_classes
from ...schemas.microstructure import MicrostructureClassResponse

router = APIRouter(prefix="/classes", tags=["microstructures"])


@router.get("", response_model=list[MicrostructureClassResponse])
def list_microstructure_classes() -> list[MicrostructureClassResponse]:
    """Return the canonical microstructure catalog."""

    return [
        MicrostructureClassResponse(**microstructure_class)
        for microstructure_class in get_microstructure_classes()
    ]
