"""Public authentication endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from aretiva.api.deps import get_current_user
from aretiva.db.models.user import User
from aretiva.db.session import get_session
from aretiva.schemas.auth import (
    AuthenticatedUserResponse,
    LoginRequest,
    LoginResponse,
    RegistrationRequest,
    UserResponse,
)
from aretiva.services.auth import login_user, register_customer

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


@router.post("/login", response_model=LoginResponse)
async def login(
    credentials: LoginRequest,
    request: Request,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> LoginResponse:
    """Authenticate credentials and return a short-lived bearer token."""
    user, access_token = await login_user(session, credentials, request.app.state.settings)
    return LoginResponse(
        access_token=access_token,
        user=AuthenticatedUserResponse.model_validate(user),
    )


@router.get("/me", response_model=AuthenticatedUserResponse)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
) -> AuthenticatedUserResponse:
    """Return the currently authenticated user."""
    return AuthenticatedUserResponse.model_validate(current_user)
