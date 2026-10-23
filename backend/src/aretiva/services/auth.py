"""Authentication use cases."""

from sqlalchemy.ext.asyncio import AsyncSession

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
    await session.commit()
    await session.refresh(user)
    return user
