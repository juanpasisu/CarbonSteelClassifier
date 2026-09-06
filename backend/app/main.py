"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.routes.auth import router as auth_router
from .api.routes.classes import router as classes_router
from .api.routes.images import router as images_router
from .core.config import get_settings

settings = get_settings()
app = FastAPI(
    title=settings.app_name,
    description="API for academic carbon-steel microstructure analysis.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(classes_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(images_router, prefix="/api/v1")


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    """Return a lightweight liveness response for local and deployment checks."""

    return {"status": "ok", "service": "carbon-steel-classifier-api"}
