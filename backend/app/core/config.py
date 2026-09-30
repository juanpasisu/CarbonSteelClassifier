"""Application settings loaded from environment variables."""

from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _strip_optional(value: str | None) -> str | None:
    """Normalize optional env strings that may include spaces or quotes."""

    if value is None:
        return None
    cleaned = value.strip().strip("'").strip('"').strip()
    return cleaned or None


class Settings(BaseSettings):
    """Runtime settings for the API.

    Supabase secrets are optional for local health checks; prediction stats and
    model registry require the service-role key on the backend only.
    """

    app_name: str = "CarbonSteelClassifier API"
    backend_host: str = "127.0.0.1"
    backend_port: int = 8000
    cors_origins: str = (
        "http://localhost:5173,http://127.0.0.1:5173,"
        "http://localhost:4173,http://127.0.0.1:4173"
    )
    supabase_url: str | None = None
    supabase_anon_key: str | None = None
    supabase_service_role_key: str | None = None
    supabase_storage_bucket: str = "microstructure-images"
    model_path: str = "../ml/models/trained/active.keras"
    # Optional HTTPS URL used by Docker/Render entrypoint to fetch active.keras.
    model_url: str | None = None
    # When set (e.g. /app/frontend/dist), FastAPI also serves the built SPA.
    frontend_dist: str | None = None
    enable_prediction_logging: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    @field_validator(
        "supabase_url",
        "supabase_anon_key",
        "supabase_service_role_key",
        "model_url",
        "frontend_dist",
        mode="before",
    )
    @classmethod
    def normalize_optional_secrets(cls, value: object) -> str | None:
        if value is None:
            return None
        return _strip_optional(str(value))

    @property
    def cors_origin_list(self) -> list[str]:
        """Return comma-separated CORS origins as a normalized list."""

        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    """Return the cached application settings instance."""

    return Settings()
