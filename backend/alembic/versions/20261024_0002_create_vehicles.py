"""Create vehicles table.

Revision ID: 20261024_0002
Revises: 20261024_0001
Create Date: 2026-10-24
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "20261024_0002"
down_revision: str | None = "20261024_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create the persistent dealership inventory."""
    op.create_table(
        "vehicles",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("vin", sa.String(length=17), nullable=False),
        sa.Column("make", sa.String(length=80), nullable=False),
        sa.Column("model", sa.String(length=100), nullable=False),
        sa.Column("category", sa.String(length=40), nullable=False),
        sa.Column("condition", sa.String(length=20), nullable=False),
        sa.Column("year", sa.SmallInteger(), nullable=False),
        sa.Column("mileage_km", sa.Integer(), nullable=False),
        sa.Column("fuel_type", sa.String(length=30), nullable=False),
        sa.Column("transmission", sa.String(length=30), nullable=False),
        sa.Column("price", sa.Numeric(12, 2), nullable=False),
        sa.Column("quantity", sa.Integer(), server_default="0", nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("image_url", sa.String(length=2048), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint("price > 0", name="ck_vehicles_price_positive"),
        sa.CheckConstraint("quantity >= 0", name="ck_vehicles_quantity_nonnegative"),
        sa.CheckConstraint("mileage_km >= 0", name="ck_vehicles_mileage_nonnegative"),
        sa.CheckConstraint("year >= 1886", name="ck_vehicles_year_valid"),
        sa.PrimaryKeyConstraint("id", name="pk_vehicles"),
        sa.UniqueConstraint("vin", name="uq_vehicles_vin"),
    )
    op.create_index("ix_vehicles_make", "vehicles", ["make"], unique=False)
    op.create_index("ix_vehicles_category", "vehicles", ["category"], unique=False)
    op.create_index("ix_vehicles_available", "vehicles", ["quantity"], unique=False)


def downgrade() -> None:
    """Remove the persistent dealership inventory."""
    op.drop_index("ix_vehicles_available", table_name="vehicles")
    op.drop_index("ix_vehicles_category", table_name="vehicles")
    op.drop_index("ix_vehicles_make", table_name="vehicles")
    op.drop_table("vehicles")
