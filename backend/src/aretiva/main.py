"""FastAPI application entry point."""

from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Public service-readiness response."""

    status: Literal["ok"] = "ok"
    service: Literal["aretiva-api"] = "aretiva-api"


def create_app() -> FastAPI:
    """Build the configured Aretiva Motors API application."""
    application = FastAPI(
        title="Aretiva Motors API",
        version="0.1.0",
        description="Vehicle inventory, purchasing, and administration API.",
    )

    @application.get("/health", response_model=HealthResponse, tags=["system"])
    async def health() -> HealthResponse:
        return HealthResponse()

    return application


app = create_app()
