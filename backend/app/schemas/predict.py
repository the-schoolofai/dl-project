from pydantic import BaseModel, Field


class ClassProbability(BaseModel):
    label: str = Field(..., description="Class label")
    probability: float = Field(..., ge=0.0, le=1.0, description="Softmax probability")


class PredictionResponse(BaseModel):
    label: str = Field(..., description="Top-1 predicted class")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Top-1 probability")
    probabilities: list[ClassProbability] = Field(
        ..., description="Per-class probabilities sorted descending"
    )
    model_name: str = Field(..., description="Identifier of the model used")
    inference_ms: float = Field(..., ge=0.0, description="Forward-pass time in ms")


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_name: str
    classes: list[str]


class ErrorResponse(BaseModel):
    detail: str
