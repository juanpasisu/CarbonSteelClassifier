#!/usr/bin/env bash
# Prepare runtime artifacts and start Uvicorn (Docker / Render).
set -euo pipefail

ROOT="${APP_ROOT:-/app}"
cd "$ROOT"

export PYTHONPATH="${PYTHONPATH:-$ROOT}"
export TMPDIR="${TMPDIR:-/tmp}"
export MPLCONFIGDIR="${MPLCONFIGDIR:-/tmp/mpl}"
mkdir -p "$TMPDIR" "$MPLCONFIGDIR"

MODEL_PATH="${MODEL_PATH:-$ROOT/ml/models/trained/active.keras}"
MODEL_DIR="$(dirname "$MODEL_PATH")"
mkdir -p "$MODEL_DIR"

if [[ ! -f "$MODEL_PATH" && -n "${MODEL_URL:-}" ]]; then
  echo "Downloading CNN weights from MODEL_URL into ${MODEL_PATH}"
  curl -fsSL --retry 3 --retry-delay 2 "$MODEL_URL" -o "$MODEL_PATH"
fi

if [[ ! -f "$MODEL_PATH" ]]; then
  echo "WARNING: model file missing at ${MODEL_PATH}." >&2
  echo "Set MODEL_URL or mount ml/models/trained/active.keras." >&2
  echo "The API will start; /predict will return 503 until the model is available." >&2
fi

PORT="${PORT:-8000}"
exec python -m uvicorn backend.app.main:app \
  --host 0.0.0.0 \
  --port "$PORT" \
  --workers 1 \
  --proxy-headers \
  --forwarded-allow-ips='*'
