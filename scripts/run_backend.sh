#!/usr/bin/env bash
# Start the FastAPI backend from the repository root using the Python 3.11 venv.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -x "$ROOT/.venv/bin/python" ]]; then
  echo "Missing $ROOT/.venv. Create it with Python 3.11 first." >&2
  exit 1
fi

export PYTHONPATH="$ROOT${PYTHONPATH:+:$PYTHONPATH}"
export TMPDIR="${TMPDIR:-$ROOT/.tmp}"
export MPLCONFIGDIR="${MPLCONFIGDIR:-$ROOT/.tmp/mpl}"
mkdir -p "$TMPDIR" "$MPLCONFIGDIR"

exec "$ROOT/.venv/bin/python" -m uvicorn backend.app.main:app \
  --reload \
  --host 127.0.0.1 \
  --port 8000
