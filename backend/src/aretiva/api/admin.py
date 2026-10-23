"""Admin-only inventory activity/transaction log endpoint."""

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from aretiva.api.deps import require_role
from aretiva.db.models.inventory_transaction import (
    InventoryTransaction,
    InventoryTransactionType,
)
from aretiva.db.models.user import User, UserRole
from aretiva.db.models.vehicle import Vehicle
from aretiva.db.session import get_session
from aretiva.schemas.activity import ActivityItem, ActivityPage
from aretiva.schemas.vehicle import PaginationMeta

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/activity", response_model=ActivityPage)
async def list_activity(
    session: Annotated[AsyncSession, Depends(get_session)],
    _: Annotated[User, Depends(require_role(UserRole.ADMIN))],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    transaction_type: InventoryTransactionType | None = None,
    vehicle_id: UUID | None = None,
) -> ActivityPage:
    """Return a paginated, reverse-chronological activity ledger; admin only."""
    filters = []
    if transaction_type is not None:
        filters.append(InventoryTransaction.transaction_type == transaction_type)
    if vehicle_id is not None:
        filters.append(InventoryTransaction.vehicle_id == vehicle_id)

    count_q = select(func.count()).select_from(InventoryTransaction)
    if filters:
        count_q = count_q.where(*filters)
    total = (await session.execute(count_q)).scalar_one()

    rows_q = (
        select(InventoryTransaction, Vehicle)
        .join(Vehicle, Vehicle.id == InventoryTransaction.vehicle_id)
        .order_by(InventoryTransaction.created_at.desc(), InventoryTransaction.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    if filters:
        rows_q = rows_q.where(*filters)
    rows = (await session.execute(rows_q)).all()

    return ActivityPage(
        items=[
            ActivityItem(
                id=tx.id,
                transaction_type=tx.transaction_type,
                quantity_delta=tx.quantity_delta,
                quantity_before=tx.quantity_before,
                quantity_after=tx.quantity_after,
                created_at=tx.created_at,
                vehicle_id=tx.vehicle_id,
                vehicle_make=vehicle.make,
                vehicle_model=vehicle.model,
                vehicle_year=vehicle.year,
                user_id=tx.user_id,
            )
            for tx, vehicle in rows
        ],
        meta=PaginationMeta(
            page=page,
            page_size=page_size,
            total=total,
            total_pages=(total + page_size - 1) // page_size,
        ),
    )
