"""Vehicle inventory endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from aretiva.api.deps import require_role
from aretiva.db.models.user import User, UserRole
from aretiva.db.session import get_session
from aretiva.schemas.vehicle import VehicleCreateRequest, VehicleResponse
from aretiva.services.vehicles import create_vehicle

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
async def create(
    vehicle_data: VehicleCreateRequest,
    session: Annotated[AsyncSession, Depends(get_session)],
    _: Annotated[User, Depends(require_role(UserRole.ADMIN))],
) -> VehicleResponse:
    """Create a vehicle in inventory; administrator access is required."""
    vehicle = await create_vehicle(session, vehicle_data)
    return VehicleResponse.model_validate(vehicle)
