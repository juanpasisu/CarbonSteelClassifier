"""Tests for anonymous prediction logging helpers."""

from backend.app.schemas.prediction import (
    ClassProbability,
    ModelInfo,
    PredictResponse,
)
from backend.app.services import prediction_logging


def test_log_anonymous_prediction_is_noop_without_supabase(monkeypatch) -> None:
    monkeypatch.setattr(
        prediction_logging,
        "try_get_supabase_admin_client",
        lambda: None,
    )
    prediction = PredictResponse(
        predicted_class="Ferrita",
        confidence=0.9,
        probabilities=[
            ClassProbability(class_name="Ferrita", probability=0.9),
            ClassProbability(class_name="Perlita", probability=0.1),
        ],
        model=ModelInfo(name="MicrostructureCNN", version="1.0"),
    )

    assert prediction_logging.log_anonymous_prediction(prediction) is None


def test_log_anonymous_prediction_writes_analysis_and_probabilities(
    monkeypatch,
) -> None:
    inserts: list[tuple[str, object]] = []

    class FakeQuery:
        def __init__(self, table_name: str) -> None:
            self.table_name = table_name

        def insert(self, payload):  # noqa: ANN001
            inserts.append((self.table_name, payload))
            self.payload = payload
            return self

        def execute(self):  # noqa: ANN201
            if self.table_name == "analyses":
                return type(
                    "Result",
                    (),
                    {"data": [{"id": "analysis-1"}]},
                )()
            return type("Result", (), {"data": []})()

    class FakeClient:
        def table(self, name: str) -> FakeQuery:
            return FakeQuery(name)

    monkeypatch.setattr(
        prediction_logging,
        "try_get_supabase_admin_client",
        lambda: FakeClient(),
    )
    monkeypatch.setattr(
        prediction_logging,
        "get_active_model_row",
        lambda: {"id": "model-1"},
    )
    monkeypatch.setattr(
        prediction_logging,
        "get_class_id_by_name",
        lambda: {"Ferrita": "class-ferrita", "Perlita": "class-perlita"},
    )

    prediction = PredictResponse(
        predicted_class="Ferrita",
        confidence=0.91,
        probabilities=[
            ClassProbability(class_name="Ferrita", probability=0.91),
            ClassProbability(class_name="Perlita", probability=0.09),
        ],
        model=ModelInfo(name="MicrostructureCNN", version="1.0"),
    )

    analysis_id = prediction_logging.log_anonymous_prediction(prediction)
    assert analysis_id == "analysis-1"
    assert inserts[0][0] == "analyses"
    assert inserts[1][0] == "predictions"
    assert len(inserts[1][1]) == 2
