"""Password hashing and access-token primitives."""

from datetime import UTC, datetime, timedelta
from uuid import uuid4

from anyio import to_thread
from jwt import encode
from pwdlib import PasswordHash

from aretiva.core.config import Settings
from aretiva.db.models.user import User

password_hasher = PasswordHash.recommended()


async def hash_password(password: str) -> str:
    """Hash a password with Argon2 without blocking the event loop."""
    return await to_thread.run_sync(password_hasher.hash, password)


async def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password without blocking the event loop."""
    return await to_thread.run_sync(password_hasher.verify, password, password_hash)


def create_access_token(user: User, settings: Settings) -> str:
    """Create a short-lived signed bearer token for an authenticated user."""
    issued_at = datetime.now(UTC)
    expires_at = issued_at + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": str(user.id),
        "role": user.role.value,
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
        "iat": issued_at,
        "exp": expires_at,
        "jti": str(uuid4()),
    }
    return encode(
        payload,
        settings.jwt_secret.get_secret_value(),
        algorithm=settings.jwt_algorithm,
    )
