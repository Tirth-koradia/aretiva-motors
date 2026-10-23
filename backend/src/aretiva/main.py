"""FastAPI application entry point."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel

from aretiva.api.router import api_router
from aretiva.core.config import Settings, get_settings
from aretiva.db.session import create_database_engine, create_session_factory


class HealthResponse(BaseModel):
    """Public service-readiness response."""

    status: Literal["ok"] = "ok"
    service: Literal["aretiva-api"] = "aretiva-api"


def create_app(settings: Settings | None = None) -> FastAPI:
    """Build the configured Aretiva Motors API application."""
    resolved_settings = settings or get_settings()
    engine = create_database_engine(resolved_settings.database_url)

    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        yield
        await engine.dispose()

    application = FastAPI(
        title="Aretiva Motors API",
        version="0.1.0",
        description="Vehicle inventory, purchasing, and administration API.",
        lifespan=lifespan,
    )
    application.state.settings = resolved_settings
    application.state.session_factory = create_session_factory(engine)
    application.include_router(api_router)

    @application.get("/health", response_model=HealthResponse, tags=["system"])
    async def health() -> HealthResponse:
        return HealthResponse()

    return application


app = create_app()
