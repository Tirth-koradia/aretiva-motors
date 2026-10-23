"""Vehicle inventory use cases."""

from sqlalchemy import func, select
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


async def list_active_vehicles(
    session: AsyncSession,
    *,
    page: int,
    page_size: int,
) -> tuple[list[Vehicle], int]:
    """Return a stable page of vehicles that remain available in the showroom."""
    active_vehicles = Vehicle.deleted_at.is_(None)
    total_result = await session.execute(
        select(func.count()).select_from(Vehicle).where(active_vehicles)
    )
    total = total_result.scalar_one()
    vehicles_result = await session.execute(
        select(Vehicle)
        .where(active_vehicles)
        .order_by(Vehicle.created_at.desc(), Vehicle.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return list(vehicles_result.scalars().all()), total
