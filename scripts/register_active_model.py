"""Register the locally trained CNN as the active model in Supabase."""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_METRICS_PATH = PROJECT_ROOT / "ml" / "models" / "trained" / "metrics.json"
DEFAULT_MODEL_PATH = "ml/models/trained/active.keras"


def read_dotenv(path: Path) -> dict[str, str]:
    """Read simple KEY=VALUE entries without exposing them in output."""

    values: dict[str, str] = {}
    if not path.is_file():
        return values

    for raw_line in path.read_text(encoding="utf-8-sig").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip("'").strip('"').strip()
        values[key] = value
    return values


def load_settings(env_file: Path) -> tuple[str, str]:
    """Load Supabase URL and service-role key."""

    file_values = read_dotenv(env_file)
    supabase_url = os.environ.get("SUPABASE_URL", file_values.get("SUPABASE_URL", ""))
    service_role_key = os.environ.get(
        "SUPABASE_SERVICE_ROLE_KEY",
        file_values.get("SUPABASE_SERVICE_ROLE_KEY", ""),
    )
    supabase_url = supabase_url.strip().strip("'").strip('"').strip()
    service_role_key = service_role_key.strip().strip("'").strip('"').strip()
    if not supabase_url or not service_role_key:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required."
        )
    return supabase_url.rstrip("/"), service_role_key


def rest_request(
    *,
    supabase_url: str,
    service_role_key: str,
    method: str,
    path: str,
    payload: dict[str, Any] | list[dict[str, Any]] | None = None,
    prefer: str | None = None,
) -> Any:
    """Execute one Supabase PostgREST request."""

    headers = {
        "apikey": service_role_key,
        "Authorization": f"Bearer {service_role_key}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer

    body = None if payload is None else json.dumps(payload).encode("utf-8")
    request = Request(
        f"{supabase_url}/rest/v1/{path}",
        data=body,
        headers=headers,
        method=method,
    )
    try:
        with urlopen(request, timeout=60) as response:
            raw = response.read().decode("utf-8")
            return json.loads(raw) if raw else None
    except HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Supabase {method} {path} failed: {detail}") from error
    except URLError as error:
        raise RuntimeError(f"Could not reach Supabase: {error}") from error


def load_metrics(metrics_path: Path) -> dict[str, Any]:
    """Load training metrics exported by the training script."""

    if not metrics_path.is_file():
        raise RuntimeError(f"Metrics file not found: {metrics_path}")
    return json.loads(metrics_path.read_text(encoding="utf-8"))


def build_model_payload(
    *,
    name: str,
    version: str,
    metrics_payload: dict[str, Any],
    file_path: str,
) -> dict[str, Any]:
    """Build the ``ml_models`` row for the active CNN."""

    metrics = metrics_payload.get("metrics", {})
    training = metrics_payload.get("training", {})
    accuracy = metrics.get("accuracy")
    return {
        "name": name,
        "version": version,
        "framework": str(training.get("framework", "tensorflow")),
        "accuracy": round(float(accuracy), 5) if accuracy is not None else None,
        "file_path": file_path,
        "is_active": True,
        "metadata": {
            "backbone": training.get("backbone", "mobilenet_v2"),
            "macro_f1": metrics.get("macro_f1"),
            "weighted_f1": metrics.get("weighted_f1"),
            "best_val_accuracy": training.get("best_val_accuracy"),
            "partition_sizes": training.get("partition_sizes"),
            "seed": training.get("seed"),
            "image_size": training.get("image_size", [224, 224]),
            "num_classes": 7,
            "preprocessing": training.get(
                "preprocessing", "mobilenet_v2.preprocess_input"
            ),
        },
    }


def register_active_model(
    *,
    supabase_url: str,
    service_role_key: str,
    name: str,
    version: str,
    metrics_path: Path,
    file_path: str,
) -> dict[str, Any]:
    """Deactivate previous models and upsert the active row."""

    metrics_payload = load_metrics(metrics_path)
    model_row = build_model_payload(
        name=name,
        version=version,
        metrics_payload=metrics_payload,
        file_path=file_path,
    )

    # Ensure only one active model: deactivate everything first.
    rest_request(
        supabase_url=supabase_url,
        service_role_key=service_role_key,
        method="PATCH",
        path="ml_models?is_active=eq.true",
        payload={"is_active": False},
        prefer="return=minimal",
    )

    upserted = rest_request(
        supabase_url=supabase_url,
        service_role_key=service_role_key,
        method="POST",
        path="ml_models?on_conflict=name,version",
        payload=model_row,
        prefer="resolution=merge-duplicates,return=representation",
    )
    if not isinstance(upserted, list) or not upserted:
        raise RuntimeError("Model upsert did not return a row.")

    # Re-assert active flag in case merge left it false from a previous row.
    model_id = upserted[0]["id"]
    activated = rest_request(
        supabase_url=supabase_url,
        service_role_key=service_role_key,
        method="PATCH",
        path=f"ml_models?id=eq.{model_id}",
        payload={"is_active": True, **{k: v for k, v in model_row.items() if k != "is_active"}},
        prefer="return=representation",
    )
    if not isinstance(activated, list) or not activated:
        raise RuntimeError("Could not activate the registered model.")
    return activated[0]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--env-file", type=Path, default=PROJECT_ROOT / ".env")
    parser.add_argument("--metrics-path", type=Path, default=DEFAULT_METRICS_PATH)
    parser.add_argument("--file-path", default=DEFAULT_MODEL_PATH)
    parser.add_argument("--name", default="MicrostructureCNN")
    parser.add_argument("--version", default="1.0")
    args = parser.parse_args()

    supabase_url, service_role_key = load_settings(args.env_file)
    row = register_active_model(
        supabase_url=supabase_url,
        service_role_key=service_role_key,
        name=args.name,
        version=args.version,
        metrics_path=args.metrics_path,
        file_path=args.file_path,
    )
    print(
        json.dumps(
            {
                "id": row.get("id"),
                "name": row.get("name"),
                "version": row.get("version"),
                "accuracy": row.get("accuracy"),
                "is_active": row.get("is_active"),
                "framework": row.get("framework"),
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as error:  # noqa: BLE001 - CLI boundary.
        print(f"error: {error}", file=sys.stderr)
        raise SystemExit(1) from error
