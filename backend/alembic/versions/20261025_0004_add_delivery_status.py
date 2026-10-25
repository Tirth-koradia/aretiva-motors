"""Add delivery_status to inventory_transactions.

Revision ID: 20261025_0004
Revises: 20261024_0003
Create Date: 2026-10-25
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20261025_0004"
down_revision: str | None = "20261024_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Add delivery_status column to inventory_transactions table."""
    op.add_column(
        "inventory_transactions",
        sa.Column(
            "delivery_status",
            sa.String(length=50),
            server_default="confirmed",
            nullable=False,
        ),
    )


def downgrade() -> None:
    """Drop delivery_status column from inventory_transactions table."""
    op.drop_column("inventory_transactions", "delivery_status")
