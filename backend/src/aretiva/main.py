"""FastAPI application entry point."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel

from aretiva.api.errors import app_error_handler
from aretiva.api.router import api_router
from aretiva.core.config import Settings, get_settings
from aretiva.core.exceptions import AppError
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
        if resolved_settings.admin_email and resolved_settings.admin_password:
            try:
                session_factory = create_session_factory(engine)
                async with session_factory() as session:
                    from aretiva.services.auth import ensure_administrator

                    await ensure_administrator(
                        session,
                        full_name="Aretiva Administrator",
                        email=str(resolved_settings.admin_email),
                        password=resolved_settings.admin_password,
                    )
            except Exception:
                pass
        yield
        await engine.dispose()

    application = FastAPI(
        title="Aretiva Motors API",
        version="0.1.0",
        description="Vehicle inventory, purchasing, and administration API.",
        lifespan=lifespan,
    )
    origins = [
        origin.strip() for origin in resolved_settings.cors_origins.split(",") if origin.strip()
    ]
    fallback_origins = (
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    )
    for fallback_origin in fallback_origins:
        if fallback_origin not in origins:
            origins.append(fallback_origin)

    from fastapi.middleware.cors import CORSMiddleware

    if "*" in origins:
        application.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    else:
        application.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_origin_regex=r"^https://.*\.vercel\.app$",
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    application.state.settings = resolved_settings
    application.state.session_factory = create_session_factory(engine)
    application.add_exception_handler(AppError, app_error_handler)
    application.include_router(api_router)

    @application.get("/health", response_model=HealthResponse, tags=["system"])
    @application.head("/health", include_in_schema=False)
    async def health() -> HealthResponse:
        return HealthResponse()

    return application


app = create_app()
