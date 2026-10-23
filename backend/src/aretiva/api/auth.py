"""Public authentication endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from aretiva.db.session import get_session
from aretiva.schemas.auth import RegistrationRequest, UserResponse
from aretiva.services.auth import register_customer

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    registration: RegistrationRequest,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> UserResponse:
    """Create a customer account; public registration can never assign admin access."""
    user = await register_customer(session, registration)
    return UserResponse.model_validate(user)
