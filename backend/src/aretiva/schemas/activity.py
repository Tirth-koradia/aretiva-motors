"""Pydantic schemas for the admin activity/transaction log."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from aretiva.db.models.inventory_transaction import InventoryTransactionType
from aretiva.schemas.vehicle import PaginationMeta


class ActivityItem(BaseModel):
    """One row in the administrator inventory-activity ledger."""

    id: UUID
    transaction_type: InventoryTransactionType
    quantity_delta: int
    quantity_before: int
    quantity_after: int
    created_at: datetime
    vehicle_id: UUID
    vehicle_make: str
    vehicle_model: str
    vehicle_year: int
    user_id: UUID | None


class ActivityPage(BaseModel):
    """A paginated administrator activity log."""

    items: list[ActivityItem]
    meta: PaginationMeta
