# syntax=docker/dockerfile:1
# Single-service image: FastAPI + TensorFlow CNN + Vite SPA (same origin).
# Optimized for Render Web Service deployments.

############################
# 1) Frontend production build
############################
FROM node:20-bookworm-slim AS frontend-build

WORKDIR /frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
# Empty string => browser calls /api/v1 on the same origin.
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

############################
# 2) API + ML runtime
############################
FROM python:3.11-slim-bookworm AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1 \
    PYTHONPATH=/app \
    APP_ROOT=/app \
    MODEL_PATH=/app/ml/models/trained/active.keras \
    FRONTEND_DIST=/app/frontend/dist \
    TF_CPP_MIN_LOG_LEVEL=2 \
    OMP_NUM_THREADS=1 \
    TF_NUM_INTEROP_THREADS=1 \
    TF_NUM_INTRAOP_THREADS=1 \
    PORT=8000

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        ca-certificates \
        libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt /tmp/backend-requirements.txt
RUN pip install -r /tmp/backend-requirements.txt \
    && rm /tmp/backend-requirements.txt

COPY backend/ ./backend/
COPY ml/src/ ./ml/src/
COPY shared/ ./shared/
COPY scripts/docker_entrypoint.sh /entrypoint.sh
COPY --from=frontend-build /frontend/dist ./frontend/dist

RUN chmod +x /entrypoint.sh \
    && mkdir -p /app/ml/models/trained \
    && useradd --create-home --uid 10001 --shell /usr/sbin/nologin appuser \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PORT}/health" || exit 1

ENTRYPOINT ["/entrypoint.sh"]
