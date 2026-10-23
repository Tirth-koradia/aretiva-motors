"""Authentication use cases."""

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from aretiva.core.config import Settings
from aretiva.core.exceptions import EmailAlreadyRegisteredError, InvalidCredentialsError
from aretiva.core.security import create_access_token, hash_password, verify_password
from aretiva.db.models.user import User, UserRole
from aretiva.schemas.auth import LoginRequest, RegistrationRequest


async def register_customer(
    session: AsyncSession,
    registration: RegistrationRequest,
) -> User:
    """Persist a new customer with a one-way password hash."""
    user = User(
        full_name=registration.full_name,
        email=str(registration.email),
        password_hash=await hash_password(registration.password),
        role=UserRole.CUSTOMER,
    )
    session.add(user)
    try:
        await session.commit()
    except IntegrityError as error:
        await session.rollback()
        raise EmailAlreadyRegisteredError from error
    await session.refresh(user)
    return user


async def authenticate_user(session: AsyncSession, credentials: LoginRequest) -> User:
    """Verify credentials without revealing whether an email exists."""
    user = await session.scalar(select(User).where(User.email == str(credentials.email)))
    if user is None or not user.is_active:
        raise InvalidCredentialsError

    password_matches = await verify_password(credentials.password, user.password_hash)
    if not password_matches:
        raise InvalidCredentialsError

    return user


async def login_user(
    session: AsyncSession,
    credentials: LoginRequest,
    settings: Settings,
) -> tuple[User, str]:
    """Authenticate a user and issue a signed bearer token."""
    user = await authenticate_user(session, credentials)
    return user, create_access_token(user, settings)
