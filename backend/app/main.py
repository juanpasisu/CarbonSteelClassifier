"""FastAPI application entry point."""

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .api.routes.classes import router as classes_router
from .api.routes.model import router as model_router
from .api.routes.predict import router as predict_router
from .core.config import get_settings

settings = get_settings()
app = FastAPI(
    title=settings.app_name,
    description="Public API for academic carbon-steel microstructure analysis.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(classes_router, prefix="/api/v1")
app.include_router(model_router, prefix="/api/v1")
app.include_router(predict_router, prefix="/api/v1")


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    """Return a lightweight liveness response for local and deployment checks."""

    return {"status": "ok", "service": "carbon-steel-classifier-api"}


def _mount_frontend_if_configured() -> None:
    """Serve the Vite production build from the same origin (Docker / Render)."""

    dist_value = settings.frontend_dist
    if not dist_value:
        return
    dist_path = Path(dist_value)
    if not dist_path.is_dir() or not (dist_path / "index.html").is_file():
        return
    # Registered last so /api/v1, /health and /docs keep priority.
    app.mount(
        "/",
        StaticFiles(directory=str(dist_path), html=True),
        name="frontend",
    )


_mount_frontend_if_configured()
