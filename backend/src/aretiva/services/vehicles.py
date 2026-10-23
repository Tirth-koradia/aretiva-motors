"""Vehicle inventory use cases."""

from sqlalchemy.ext.asyncio import AsyncSession

from aretiva.db.models.vehicle import Vehicle
from aretiva.schemas.vehicle import VehicleCreateRequest


async def create_vehicle(session: AsyncSession, vehicle_data: VehicleCreateRequest) -> Vehicle:
    """Persist one administrator-supplied inventory vehicle."""
    vehicle = Vehicle(**vehicle_data.model_dump())
    session.add(vehicle)
    await session.commit()
    await session.refresh(vehicle)
    return vehicle
