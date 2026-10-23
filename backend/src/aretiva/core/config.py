"""Environment-backed application configuration."""

from functools import lru_cache
from typing import Literal

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Validated runtime configuration."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    environment: Literal["development", "test", "production"] = "development"
    database_url: str = "postgresql+psycopg://aretiva:aretiva_dev@localhost:55432/aretiva"
    jwt_secret: SecretStr = SecretStr("development-only-secret-change-before-deploying")
    jwt_algorithm: str = "HS256"
    jwt_issuer: str = "aretiva-motors-api"
    jwt_audience: str = "aretiva-motors-web"
    access_token_expire_minutes: int = 30
    cors_origins: str = "http://localhost:5173"
    admin_email: str | None = None
    admin_password: SecretStr | None = None


@lru_cache
def get_settings() -> Settings:
    """Return the process-wide settings instance."""
    return Settings()
