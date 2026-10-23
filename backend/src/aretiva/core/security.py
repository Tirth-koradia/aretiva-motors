"""Password hashing primitives."""

from anyio import to_thread
from pwdlib import PasswordHash

password_hasher = PasswordHash.recommended()


async def hash_password(password: str) -> str:
    """Hash a password with Argon2 without blocking the event loop."""
    return await to_thread.run_sync(password_hasher.hash, password)


async def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password without blocking the event loop."""
    return await to_thread.run_sync(password_hasher.verify, password, password_hash)
