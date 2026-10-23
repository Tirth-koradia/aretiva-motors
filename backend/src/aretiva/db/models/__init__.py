"""Persisted domain models."""

from aretiva.db.models.inventory_transaction import (
    InventoryTransaction,
    InventoryTransactionType,
)
from aretiva.db.models.user import User, UserRole
from aretiva.db.models.vehicle import Vehicle

__all__ = [
    "InventoryTransaction",
    "InventoryTransactionType",
    "User",
    "UserRole",
    "Vehicle",
]
