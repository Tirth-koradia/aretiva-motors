"""Top-level API router."""

from fastapi import APIRouter

from aretiva.api.auth import router as auth_router
from aretiva.api.vehicles import router as vehicles_router

api_router = APIRouter(prefix="/api")
api_router.include_router(auth_router)
api_router.include_router(vehicles_router)
