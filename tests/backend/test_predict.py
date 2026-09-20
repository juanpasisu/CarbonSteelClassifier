"""Tests for model availability and prediction readiness."""

from fastapi.testclient import TestClient

from backend.app.api.routes import model as model_route
from backend.app.api.routes import predict as predict_route
from backend.app.main import app
from backend.app.schemas.prediction import ModelStatusResponse
from backend.app.services import inference


client = TestClient(app)

VALID_PNG = bytes.fromhex(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489"
    "0000000d49444154789c63f8cfc0f01f00050001ff89993d1d"
    "0000000049454e44ae426082"
)


def test_model_endpoint_reports_active_model() -> None:
    inference.clear_predictor_cache()
    response = client.get("/api/v1/model")
    assert response.status_code == 200
    payload = response.json()
    assert payload["available"] is True
    assert payload["name"] == "MicrostructureCNN"


def test_model_endpoint_can_report_unavailable(monkeypatch) -> None:
    monkeypatch.setattr(
        model_route,
        "get_model_status",
        lambda: ModelStatusResponse(
            available=False,
            detail="The trained CNN is not available yet.",
        ),
    )

    response = client.get("/api/v1/model")
    assert response.status_code == 200
    assert response.json()["available"] is False


def test_predict_rejects_invalid_image_before_model_check() -> None:
    response = client.post(
        "/api/v1/predict",
        files={"file": ("sample.png", b"not-an-image", "image/png")},
    )
    assert response.status_code == 400


def test_predict_returns_service_unavailable_without_model(monkeypatch) -> None:
    def unavailable() -> ModelStatusResponse:
        raise inference.ModelUnavailableError(
            "The trained CNN is not available yet."
        )

    monkeypatch.setattr(predict_route, "require_model_ready", unavailable)

    response = client.post(
        "/api/v1/predict",
        files={"file": ("sample.png", VALID_PNG, "image/png")},
    )
    assert response.status_code == 503
    assert "not available" in response.json()["detail"].lower()


def test_predict_returns_seven_class_probabilities() -> None:
    inference.clear_predictor_cache()
    response = client.post(
        "/api/v1/predict",
        files={"file": ("sample.png", VALID_PNG, "image/png")},
    )
    assert response.status_code == 200
    payload = response.json()
    assert "predicted_class" in payload
    assert 0.0 <= payload["confidence"] <= 1.0
    assert len(payload["probabilities"]) == 7
    assert abs(sum(item["probability"] for item in payload["probabilities"]) - 1.0) < 1e-5
    assert "identified_phases" in payload
    assert {item["name"] for item in payload["identified_phases"]} == {
        "Ferrita",
        "Perlita",
        "Cementita",
    }
