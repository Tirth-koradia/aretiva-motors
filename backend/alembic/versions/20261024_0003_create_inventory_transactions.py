"""Create immutable inventory transaction ledger.

Revision ID: 20261024_0003
Revises: 20261024_0002
Create Date: 2026-10-24
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "20261024_0003"
down_revision: str | None = "20261024_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

transaction_type = postgresql.ENUM(
    "purchase",
    "restock",
    name="inventory_transaction_type",
    create_type=False,
)


def upgrade() -> None:
    """Create the stock-change ledger used for purchases and restocks."""
    transaction_type.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "inventory_transactions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("vehicle_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("transaction_type", transaction_type, nullable=False),
        sa.Column("quantity_delta", sa.Integer(), nullable=False),
        sa.Column("quantity_before", sa.Integer(), nullable=False),
        sa.Column("quantity_after", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint("quantity_delta != 0", name="ck_inventory_transactions_delta_nonzero"),
        sa.CheckConstraint(
            "quantity_after >= 0", name="ck_inventory_transactions_after_nonnegative"
        ),
        sa.CheckConstraint(
            "quantity_after = quantity_before + quantity_delta",
            name="ck_inventory_transactions_quantity_consistent",
        ),
        sa.ForeignKeyConstraint(["vehicle_id"], ["vehicles.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id", name="pk_inventory_transactions"),
    )
    op.create_index(
        "ix_inventory_transactions_vehicle_created",
        "inventory_transactions",
        ["vehicle_id", "created_at"],
        unique=False,
    )
    op.create_index(
        "ix_inventory_transactions_user_created",
        "inventory_transactions",
        ["user_id", "created_at"],
        unique=False,
    )


def downgrade() -> None:
    """Remove the inventory transaction ledger."""
    op.drop_index("ix_inventory_transactions_user_created", table_name="inventory_transactions")
    op.drop_index("ix_inventory_transactions_vehicle_created", table_name="inventory_transactions")
    op.drop_table("inventory_transactions")
    transaction_type.drop(op.get_bind(), checkfirst=True)
