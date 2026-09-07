"""Active model status endpoint."""

from fastapi import APIRouter

from ...schemas.prediction import ModelStatusResponse
from ...services.inference import get_model_status

router = APIRouter(prefix="/model", tags=["model"])


@router.get("", response_model=ModelStatusResponse)
def read_active_model() -> ModelStatusResponse:
    """Return availability and metadata for the active CNN."""

    return get_model_status()
