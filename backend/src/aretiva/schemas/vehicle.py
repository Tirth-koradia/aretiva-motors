"""Vehicle inventory request and response contracts."""

from datetime import datetime
from decimal import Decimal
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

VehicleCondition = Literal["new", "pre_owned"]
VehicleCategory = Literal["sedan", "suv", "hatchback", "coupe", "convertible", "truck", "van"]
FuelType = Literal["petrol", "diesel", "hybrid", "electric"]
Transmission = Literal["manual", "automatic"]
VehicleSort = Literal["newest", "price_asc", "price_desc", "year_desc"]
Money = Annotated[Decimal, Field(gt=Decimal("0"), max_digits=12, decimal_places=2)]


class VehicleCreateRequest(BaseModel):
    """Vehicle data accepted from an administrator."""

    model_config = ConfigDict(extra="forbid")

    vin: str = Field(min_length=17, max_length=17)
    make: str = Field(min_length=1, max_length=80)
    model: str = Field(min_length=1, max_length=100)
    category: VehicleCategory
    condition: VehicleCondition
    year: int = Field(ge=1886, le=2100)
    mileage_km: int = Field(ge=0)
    fuel_type: FuelType
    transmission: Transmission
    price: Money
    quantity: int = Field(ge=0)
    description: str = Field(min_length=10, max_length=4000)
    image_url: str | None = Field(default=None, max_length=2048, pattern=r"^https?://")

    @field_validator("vin")
    @classmethod
    def normalize_vin(cls, value: str) -> str:
        """Store VINs in a stable comparable format."""
        normalized_value = value.strip().upper()
        if len(normalized_value) != 17 or " " in normalized_value:
            raise ValueError("VIN must contain exactly 17 non-space characters.")
        return normalized_value

    @field_validator("make", "model", "description")
    @classmethod
    def trim_text(cls, value: str) -> str:
        """Avoid persisting accidental whitespace-only variation."""
        return " ".join(value.split())


class VehicleResponse(BaseModel):
    """Public representation of a vehicle."""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    vin: str
    make: str
    model: str
    category: VehicleCategory
    condition: VehicleCondition
    year: int
    mileage_km: int
    fuel_type: FuelType
    transmission: Transmission
    price: Decimal
    quantity: int
    description: str
    image_url: str | None
    deleted_at: datetime | None
    created_at: datetime
    updated_at: datetime


class PaginationMeta(BaseModel):
    """Server-calculated pagination details for a collection response."""

    page: int
    page_size: int
    total: int
    total_pages: int


class VehiclePage(BaseModel):
    """A page of active showroom inventory."""

    items: list[VehicleResponse]
    meta: PaginationMeta


class RestockRequest(BaseModel):
    """The positive quantity an administrator adds to one vehicle."""

    model_config = ConfigDict(extra="forbid")

    quantity: int = Field(ge=1, le=1000)


class StockActionResponse(BaseModel):
    """Confirmation returned after an atomic purchase or restock."""

    transaction_id: UUID
    vehicle_id: UUID
    quantity_remaining: int


class PurchasedVehicleSummary(BaseModel):
    """The vehicle information retained alongside a customer's purchase entry."""

    id: UUID
    make: str
    model: str
    year: int
    price: Decimal
    image_url: str | None


class PurchaseHistoryItem(BaseModel):
    """A customer's completed one-unit purchase with its display vehicle details."""

    id: UUID
    quantity: int
    purchased_at: datetime
    delivery_status: str = "confirmed"
    vehicle: PurchasedVehicleSummary


class PurchaseHistoryPage(BaseModel):
    """A paginated private purchase ledger projection."""

    items: list[PurchaseHistoryItem]
    meta: PaginationMeta
