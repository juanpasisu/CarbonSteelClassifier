"""Anonymous prediction logging and active model registry in Supabase."""

from __future__ import annotations

import logging
from functools import lru_cache
from typing import Any

from ..core.config import get_settings
from ..core.supabase_client import try_get_supabase_admin_client
from ..schemas.prediction import PredictResponse

logger = logging.getLogger(__name__)


class ModelRegistryError(RuntimeError):
    """Raised when the active model cannot be resolved in Supabase."""


@lru_cache
def get_active_model_row() -> dict[str, Any] | None:
    """Fetch the currently active model row from ``ml_models``."""

    client = try_get_supabase_admin_client()
    if client is None:
        return None

    result = (
        client.table("ml_models")
        .select("id,name,version,framework,accuracy,file_path,is_active,metadata")
        .eq("is_active", True)
        .limit(1)
        .execute()
    )
    rows = getattr(result, "data", None)
    if not isinstance(rows, list) or not rows:
        return None
    row = rows[0]
    return row if isinstance(row, dict) else None


@lru_cache
def get_class_id_by_name() -> dict[str, str]:
    """Map microstructure display names to Supabase UUIDs."""

    client = try_get_supabase_admin_client()
    if client is None:
        return {}

    result = (
        client.table("microstructure_classes")
        .select("id,name")
        .execute()
    )
    rows = getattr(result, "data", None)
    if not isinstance(rows, list):
        return {}

    mapping: dict[str, str] = {}
    for row in rows:
        if isinstance(row, dict) and row.get("id") and row.get("name"):
            mapping[str(row["name"])] = str(row["id"])
    return mapping


def clear_registry_cache() -> None:
    """Drop cached Supabase lookups (useful after registration or in tests)."""

    get_active_model_row.cache_clear()
    get_class_id_by_name.cache_clear()


def log_anonymous_prediction(prediction: PredictResponse) -> str | None:
    """Persist an anonymous analysis and its class probabilities.

    Failures are logged and swallowed so prediction latency and availability
    never depend on Supabase.
    """

    settings = get_settings()
    if not settings.enable_prediction_logging:
        return None

    client = try_get_supabase_admin_client()
    if client is None:
        logger.debug("Skipping prediction logging: Supabase is not configured.")
        return None

    try:
        model_row = get_active_model_row()
        if model_row is None:
            logger.warning("Skipping prediction logging: no active ml_models row.")
            return None

        class_ids = get_class_id_by_name()
        predicted_class_id = class_ids.get(prediction.predicted_class)
        if not predicted_class_id:
            logger.warning(
                "Skipping prediction logging: unknown class %s",
                prediction.predicted_class,
            )
            return None

        analysis_insert = (
            client.table("analyses")
            .insert(
                {
                    "predicted_class_id": predicted_class_id,
                    "confidence": round(float(prediction.confidence), 5),
                    "model_id": model_row["id"],
                }
            )
            .execute()
        )
        analysis_rows = getattr(analysis_insert, "data", None)
        if not isinstance(analysis_rows, list) or not analysis_rows:
            raise ModelRegistryError("Analysis insert returned no rows.")

        analysis_id = str(analysis_rows[0]["id"])
        probability_rows: list[dict[str, Any]] = []
        for item in prediction.probabilities:
            class_id = class_ids.get(item.class_name)
            if not class_id:
                continue
            probability_rows.append(
                {
                    "analysis_id": analysis_id,
                    "microstructure_class_id": class_id,
                    "probability": round(float(item.probability), 5),
                }
            )

        if probability_rows:
            client.table("predictions").insert(probability_rows).execute()

        return analysis_id
    except Exception:  # noqa: BLE001 - never fail the public prediction path.
        logger.exception("Anonymous prediction logging failed.")
        return None
