"""Pydantic schemas for the admin activity/transaction log."""

from datetime import datetime
from decimal import Decimal
from typing import Literal
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


DeliveryStatus = Literal["confirmed", "detailing", "en_route", "handover_ready"]


class DeliveryItem(BaseModel):
    """One customer delivery dispatch tracked by the concierge desk."""

    id: UUID
    created_at: datetime
    delivery_status: str
    customer_id: UUID | None
    customer_name: str | None
    customer_email: str | None
    vehicle_id: UUID
    vehicle_make: str
    vehicle_model: str
    vehicle_year: int
    vehicle_price: Decimal
    vehicle_image_url: str | None


class DeliveryPage(BaseModel):
    """A paginated list of concierge deliveries."""

    items: list[DeliveryItem]
    meta: PaginationMeta


class UpdateDeliveryStatusRequest(BaseModel):
    """Administrator update to a delivery's lifecycle state."""

    delivery_status: DeliveryStatus
