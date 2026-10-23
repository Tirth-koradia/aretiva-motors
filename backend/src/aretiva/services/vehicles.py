"""Vehicle inventory use cases."""

from decimal import Decimal

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from aretiva.db.models.vehicle import Vehicle
from aretiva.schemas.vehicle import VehicleCreateRequest, VehicleSort


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


async def search_active_vehicles(
    session: AsyncSession,
    *,
    page: int,
    page_size: int,
    query: str | None,
    make: str | None,
    category: str | None,
    min_price: Decimal | None,
    max_price: Decimal | None,
    min_year: int | None,
    max_year: int | None,
    in_stock: bool | None,
    sort: VehicleSort,
) -> tuple[list[Vehicle], int]:
    """Filter active inventory using safe, explicit showroom controls."""
    filters = [Vehicle.deleted_at.is_(None)]
    if query and query.strip():
        query_pattern = f"%{query.strip()}%"
        filters.append(
            or_(
                Vehicle.make.ilike(query_pattern),
                Vehicle.model.ilike(query_pattern),
                Vehicle.description.ilike(query_pattern),
            )
        )
    if make and make.strip():
        filters.append(func.lower(Vehicle.make) == make.strip().lower())
    if category is not None:
        filters.append(Vehicle.category == category)
    if min_price is not None:
        filters.append(Vehicle.price >= min_price)
    if max_price is not None:
        filters.append(Vehicle.price <= max_price)
    if min_year is not None:
        filters.append(Vehicle.year >= min_year)
    if max_year is not None:
        filters.append(Vehicle.year <= max_year)
    if in_stock is True:
        filters.append(Vehicle.quantity > 0)
    if in_stock is False:
        filters.append(Vehicle.quantity == 0)

    sort_orders = {
        "newest": (Vehicle.created_at.desc(), Vehicle.id.desc()),
        "price_asc": (Vehicle.price.asc(), Vehicle.id.asc()),
        "price_desc": (Vehicle.price.desc(), Vehicle.id.desc()),
        "year_desc": (Vehicle.year.desc(), Vehicle.id.desc()),
    }
    total_result = await session.execute(select(func.count()).select_from(Vehicle).where(*filters))
    total = total_result.scalar_one()
    vehicles_result = await session.execute(
        select(Vehicle)
        .where(*filters)
        .order_by(*sort_orders[sort])
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return list(vehicles_result.scalars().all()), total
