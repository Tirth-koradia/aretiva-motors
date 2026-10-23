"""Vehicle inventory endpoints."""

from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from aretiva.api.deps import get_current_user, require_role
from aretiva.db.models.user import User, UserRole
from aretiva.db.session import get_session
from aretiva.schemas.vehicle import (
    PaginationMeta,
    VehicleCategory,
    VehicleCreateRequest,
    VehiclePage,
    VehicleResponse,
    VehicleSort,
)
from aretiva.services.vehicles import (
    create_vehicle,
    list_active_vehicles,
    search_active_vehicles,
)

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


@router.get("", response_model=VehiclePage)
async def list_vehicles(
    session: Annotated[AsyncSession, Depends(get_session)],
    _: Annotated[User, Depends(get_current_user)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=50)] = 12,
) -> VehiclePage:
    """List active inventory for an authenticated showroom visitor."""
    vehicles, total = await list_active_vehicles(session, page=page, page_size=page_size)
    return VehiclePage(
        items=[VehicleResponse.model_validate(vehicle) for vehicle in vehicles],
        meta=PaginationMeta(
            page=page,
            page_size=page_size,
            total=total,
            total_pages=(total + page_size - 1) // page_size,
        ),
    )


@router.get("/search", response_model=VehiclePage)
async def search_vehicles(
    session: Annotated[AsyncSession, Depends(get_session)],
    _: Annotated[User, Depends(get_current_user)],
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=50)] = 12,
    query: Annotated[str | None, Query(max_length=100)] = None,
    make: Annotated[str | None, Query(max_length=80)] = None,
    category: VehicleCategory | None = None,
    min_price: Annotated[Decimal | None, Query(ge=0)] = None,
    max_price: Annotated[Decimal | None, Query(ge=0)] = None,
    min_year: Annotated[int | None, Query(ge=1886, le=2100)] = None,
    max_year: Annotated[int | None, Query(ge=1886, le=2100)] = None,
    in_stock: bool | None = None,
    sort: VehicleSort = "newest",
) -> VehiclePage:
    """Search active inventory through constrained, server-side filters."""
    vehicles, total = await search_active_vehicles(
        session,
        page=page,
        page_size=page_size,
        query=query,
        make=make,
        category=category,
        min_price=min_price,
        max_price=max_price,
        min_year=min_year,
        max_year=max_year,
        in_stock=in_stock,
        sort=sort,
    )
    return VehiclePage(
        items=[VehicleResponse.model_validate(vehicle) for vehicle in vehicles],
        meta=PaginationMeta(
            page=page,
            page_size=page_size,
            total=total,
            total_pages=(total + page_size - 1) // page_size,
        ),
    )


@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
async def create(
    vehicle_data: VehicleCreateRequest,
    session: Annotated[AsyncSession, Depends(get_session)],
    _: Annotated[User, Depends(require_role(UserRole.ADMIN))],
) -> VehicleResponse:
    """Create a vehicle in inventory; administrator access is required."""
    vehicle = await create_vehicle(session, vehicle_data)
    return VehicleResponse.model_validate(vehicle)
