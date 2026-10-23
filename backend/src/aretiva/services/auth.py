"""Authentication use cases."""

from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from aretiva.core.exceptions import EmailAlreadyRegisteredError
from aretiva.core.security import hash_password
from aretiva.db.models.user import User, UserRole
from aretiva.schemas.auth import RegistrationRequest


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
