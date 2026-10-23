"""Vehicle inventory use cases."""

from datetime import UTC, datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from aretiva.core.exceptions import VehicleNotFoundError, VehicleOutOfStockError
from aretiva.db.models.inventory_transaction import (
    InventoryTransaction,
    InventoryTransactionType,
)
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


async def get_active_vehicle(session: AsyncSession, vehicle_id: UUID) -> Vehicle | None:
    """Return one active vehicle or nothing when it is unavailable to the showroom."""
    result = await session.execute(
        select(Vehicle).where(Vehicle.id == vehicle_id, Vehicle.deleted_at.is_(None))
    )
    return result.scalar_one_or_none()


async def update_vehicle(
    session: AsyncSession,
    vehicle: Vehicle,
    vehicle_data: VehicleCreateRequest,
) -> Vehicle:
    """Replace editable vehicle attributes with administrator-supplied values."""
    for field_name, value in vehicle_data.model_dump().items():
        setattr(vehicle, field_name, value)
    await session.commit()
    await session.refresh(vehicle)
    return vehicle


async def soft_delete_vehicle(session: AsyncSession, vehicle: Vehicle) -> None:
    """Retain an audit-friendly record while hiding it from active inventory."""
    vehicle.deleted_at = datetime.now(UTC)
    await session.commit()


async def purchase_vehicle(
    session: AsyncSession,
    *,
    vehicle_id: UUID,
    customer_id: UUID,
) -> InventoryTransaction:
    """Atomically reserve exactly one available vehicle and write its ledger entry."""
    try:
        result = await session.execute(
            update(Vehicle)
            .where(
                Vehicle.id == vehicle_id,
                Vehicle.deleted_at.is_(None),
                Vehicle.quantity >= 1,
            )
            .values(quantity=Vehicle.quantity - 1)
            .returning(Vehicle.quantity)
        )
        quantity_after = result.scalar_one_or_none()
        if quantity_after is None:
            await session.rollback()
            if await get_active_vehicle(session, vehicle_id) is None:
                raise VehicleNotFoundError
            raise VehicleOutOfStockError

        transaction = InventoryTransaction(
            vehicle_id=vehicle_id,
            user_id=customer_id,
            transaction_type=InventoryTransactionType.PURCHASE,
            quantity_delta=-1,
            quantity_before=quantity_after + 1,
            quantity_after=quantity_after,
        )
        session.add(transaction)
        await session.flush()
        await session.commit()
        return transaction
    except Exception:
        await session.rollback()
        raise


async def restock_vehicle(
    session: AsyncSession,
    *,
    vehicle_id: UUID,
    administrator_id: UUID,
    quantity: int,
) -> InventoryTransaction:
    """Atomically add stock and append the corresponding administrator ledger entry."""
    try:
        result = await session.execute(
            update(Vehicle)
            .where(Vehicle.id == vehicle_id, Vehicle.deleted_at.is_(None))
            .values(quantity=Vehicle.quantity + quantity)
            .returning(Vehicle.quantity)
        )
        quantity_after = result.scalar_one_or_none()
        if quantity_after is None:
            await session.rollback()
            raise VehicleNotFoundError

        transaction = InventoryTransaction(
            vehicle_id=vehicle_id,
            user_id=administrator_id,
            transaction_type=InventoryTransactionType.RESTOCK,
            quantity_delta=quantity,
            quantity_before=quantity_after - quantity,
            quantity_after=quantity_after,
        )
        session.add(transaction)
        await session.flush()
        await session.commit()
        return transaction
    except Exception:
        await session.rollback()
        raise


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
