"""Shared authorization dependencies."""

from typing import Annotated
from uuid import UUID

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError, decode
from sqlalchemy.ext.asyncio import AsyncSession

from aretiva.core.exceptions import UnauthenticatedError
from aretiva.db.models.user import User
from aretiva.db.session import get_session

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(bearer_scheme),
    ],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> User:
    """Return the active user identified by a valid signed bearer token."""
    if credentials is None:
        raise UnauthenticatedError

    settings = request.app.state.settings
    try:
        payload = decode(
            credentials.credentials,
            settings.jwt_secret.get_secret_value(),
            algorithms=[settings.jwt_algorithm],
            issuer=settings.jwt_issuer,
            audience=settings.jwt_audience,
        )
        user_id = UUID(payload["sub"])
    except (InvalidTokenError, KeyError, ValueError) as error:
        raise UnauthenticatedError from error

    user = await session.get(User, user_id)
    if user is None or not user.is_active:
        raise UnauthenticatedError

    return user
