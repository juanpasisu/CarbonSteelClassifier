"""Prediction response schemas."""

from pydantic import BaseModel, ConfigDict, Field


class ClassProbability(BaseModel):
    """Probability assigned to one microstructure class."""

    model_config = ConfigDict(populate_by_name=True, ser_json_by_alias=True)

    class_name: str = Field(serialization_alias="class", validation_alias="class")
    probability: float


class ModelInfo(BaseModel):
    """Active model metadata returned with predictions."""

    name: str
    version: str
    framework: str = "TensorFlow/Keras"


class PredictResponse(BaseModel):
    """Successful CNN prediction payload."""

    predicted_class: str
    confidence: float
    probabilities: list[ClassProbability]
    model: ModelInfo


class ModelStatusResponse(BaseModel):
    """Status of the model currently configured for inference."""

    available: bool
    name: str | None = None
    version: str | None = None
    detail: str | None = None
