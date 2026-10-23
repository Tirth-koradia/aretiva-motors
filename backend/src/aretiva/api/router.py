"""Top-level API router."""

from fastapi import APIRouter

from aretiva.api.admin import router as admin_router
from aretiva.api.auth import router as auth_router
from aretiva.api.purchases import router as purchases_router
from aretiva.api.vehicles import router as vehicles_router

api_router = APIRouter(prefix="/api")
api_router.include_router(admin_router)
api_router.include_router(auth_router)
api_router.include_router(purchases_router)
api_router.include_router(vehicles_router)
