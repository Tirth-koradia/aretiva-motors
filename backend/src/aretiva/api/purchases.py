"""Private customer purchase-history endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from aretiva.api.deps import require_role
from aretiva.db.models.user import User, UserRole
from aretiva.db.session import get_session
from aretiva.schemas.vehicle import (
    PaginationMeta,
    PurchasedVehicleSummary,
    PurchaseHistoryItem,
    PurchaseHistoryPage,
)
from aretiva.services.purchases import list_customer_purchases

router = APIRouter(prefix="/purchases", tags=["purchases"])


@router.get("", response_model=PurchaseHistoryPage)
async def list_purchases(
    session: Annotated[AsyncSession, Depends(get_session)],
    current_user: Annotated[User, Depends(require_role(UserRole.CUSTOMER))],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=50)] = 12,
) -> PurchaseHistoryPage:
    """Return the signed-in customer's immutable purchase history only."""
    purchases, total = await list_customer_purchases(
        session,
        customer_id=current_user.id,
        page=page,
        page_size=page_size,
    )
    return PurchaseHistoryPage(
        items=[
            PurchaseHistoryItem(
                id=transaction.id,
                quantity=abs(transaction.quantity_delta),
                purchased_at=transaction.created_at,
                delivery_status=transaction.delivery_status,
                vehicle=PurchasedVehicleSummary(
                    id=vehicle.id,
                    make=vehicle.make,
                    model=vehicle.model,
                    year=vehicle.year,
                    price=vehicle.price,
                    image_url=vehicle.image_url,
                ),
            )
            for transaction, vehicle in purchases
        ],
        meta=PaginationMeta(
            page=page,
            page_size=page_size,
            total=total,
            total_pages=(total + page_size - 1) // page_size,
        ),
    )
