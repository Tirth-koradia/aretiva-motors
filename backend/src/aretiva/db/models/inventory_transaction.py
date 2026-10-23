"""Immutable records of stock movements."""

from datetime import datetime
from enum import StrEnum
from uuid import UUID, uuid4

from sqlalchemy import CheckConstraint, DateTime, Enum, ForeignKey, Integer, func
from sqlalchemy.dialects.postgresql import UUID as PostgreSQLUUID
from sqlalchemy.orm import Mapped, mapped_column

from aretiva.db.base import Base


class InventoryTransactionType(StrEnum):
    """The two stock-changing actions exposed by the application."""

    PURCHASE = "purchase"
    RESTOCK = "restock"


class InventoryTransaction(Base):
    """An append-only audit record for an inventory quantity change."""

    __tablename__ = "inventory_transactions"
    __table_args__ = (
        CheckConstraint("quantity_delta != 0", name="ck_inventory_transactions_delta_nonzero"),
        CheckConstraint("quantity_after >= 0", name="ck_inventory_transactions_after_nonnegative"),
        CheckConstraint(
            "quantity_after = quantity_before + quantity_delta",
            name="ck_inventory_transactions_quantity_consistent",
        ),
    )

    id: Mapped[UUID] = mapped_column(PostgreSQLUUID(as_uuid=True), primary_key=True, default=uuid4)
    vehicle_id: Mapped[UUID] = mapped_column(
        PostgreSQLUUID(as_uuid=True), ForeignKey("vehicles.id", ondelete="RESTRICT"), index=True
    )
    user_id: Mapped[UUID | None] = mapped_column(
        PostgreSQLUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    transaction_type: Mapped[InventoryTransactionType] = mapped_column(
        Enum(
            InventoryTransactionType,
            name="inventory_transaction_type",
            values_callable=lambda values: [value.value for value in values],
        )
    )
    quantity_delta: Mapped[int] = mapped_column(Integer)
    quantity_before: Mapped[int] = mapped_column(Integer)
    quantity_after: Mapped[int] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
