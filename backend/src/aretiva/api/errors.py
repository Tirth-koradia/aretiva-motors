"""Stable public error responses."""

from fastapi import Request
from fastapi.responses import JSONResponse

from aretiva.core.exceptions import AppError


async def app_error_handler(_: Request, error: AppError) -> JSONResponse:
    """Translate a known application error into the shared API envelope."""
    return JSONResponse(
        status_code=error.status_code,
        content={
            "error": {
                "code": error.code,
                "message": error.message,
            }
        },
        headers=error.headers,
    )
