"""Customer-facing projections of immutable purchase ledger records."""

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from aretiva.db.models.inventory_transaction import (
    InventoryTransaction,
    InventoryTransactionType,
)
from aretiva.db.models.vehicle import Vehicle


async def list_customer_purchases(
    session: AsyncSession,
    *,
    customer_id: UUID,
    page: int,
    page_size: int,
) -> tuple[list[tuple[InventoryTransaction, Vehicle]], int]:
    """Return a customer's completed purchases with display data for their vehicles."""
    filters = (
        InventoryTransaction.user_id == customer_id,
        InventoryTransaction.transaction_type == InventoryTransactionType.PURCHASE,
    )
    total_result = await session.execute(
        select(func.count()).select_from(InventoryTransaction).where(*filters)
    )
    total = total_result.scalar_one()
    purchase_result = await session.execute(
        select(InventoryTransaction, Vehicle)
        .join(Vehicle, Vehicle.id == InventoryTransaction.vehicle_id)
        .where(*filters)
        .order_by(InventoryTransaction.created_at.desc(), InventoryTransaction.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return list(purchase_result.all()), total
