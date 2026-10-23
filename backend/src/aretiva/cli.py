"""Safe operator commands for Aretiva Motors."""

import argparse
import asyncio

from aretiva.core.config import Settings, get_settings
from aretiva.db.session import create_database_engine, create_session_factory
from aretiva.services.auth import ensure_administrator


async def bootstrap_admin(settings: Settings, full_name: str) -> None:
    """Create or promote the configured local administrator without public exposure."""
    if settings.admin_email is None or settings.admin_password is None:
        raise ValueError(
            "ADMIN_EMAIL and ADMIN_PASSWORD must be set before bootstrapping an admin."
        )

    engine = create_database_engine(settings.database_url)
    session_factory = create_session_factory(engine)
    try:
        async with session_factory() as session:
            user, created = await ensure_administrator(
                session,
                full_name=full_name,
                email=str(settings.admin_email),
                password=settings.admin_password,
            )
        action = "Created" if created else "Confirmed"
        print(f"{action} administrator account for {user.email}.")
    finally:
        await engine.dispose()


def main() -> None:
    """Parse operator-only commands."""
    parser = argparse.ArgumentParser(prog="aretiva-admin")
    parser.add_argument(
        "--name",
        default="Aretiva Administrator",
        help="Display name for a newly created administrator.",
    )
    arguments = parser.parse_args()
    asyncio.run(bootstrap_admin(get_settings(), arguments.name))


if __name__ == "__main__":
    main()
