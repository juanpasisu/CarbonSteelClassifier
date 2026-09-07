"""Public microstructure prediction endpoint."""

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from ...schemas.prediction import PredictResponse
from ...services.file_validation import MAX_IMAGE_SIZE_BYTES, InvalidImageError
from ...services.image_pipeline import prepare_image_for_inference
from ...services.inference import (
    InferenceError,
    ModelUnavailableError,
    predict_image_bytes,
    require_model_ready,
)
from ...services.prediction_logging import log_anonymous_prediction

router = APIRouter(prefix="/predict", tags=["prediction"])


@router.post("", response_model=PredictResponse)
def predict_microstructure(
    file: UploadFile = File(...),
) -> PredictResponse:
    """Validate an uploaded image in memory and run CNN inference when available."""

    content = file.file.read(MAX_IMAGE_SIZE_BYTES + 1)
    try:
        prepare_image_for_inference(
            filename=file.filename,
            content_type=file.content_type,
            content=content,
        )
    except InvalidImageError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        ) from error

    try:
        require_model_ready()
        prediction = predict_image_bytes(content)
    except ModelUnavailableError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error),
        ) from error
    except InferenceError as error:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(error),
        ) from error

    log_anonymous_prediction(prediction)
    return prediction
