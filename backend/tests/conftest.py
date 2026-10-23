"""Shared PostgreSQL-backed API test fixtures."""

import os
from collections.abc import Iterator
from pathlib import Path
from uuid import uuid4

import psycopg
import pytest
from alembic.config import Config
from fastapi.testclient import TestClient
from psycopg import sql

from alembic import command
from aretiva.core.config import Settings
from aretiva.core.security import create_access_token
from aretiva.db.models.user import User, UserRole
from aretiva.main import create_app

BACKEND_ROOT = Path(__file__).parents[1]
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://aretiva:aretiva_dev@localhost:55432/aretiva_test",
)


@pytest.fixture(scope="session")
def migrated_database() -> Iterator[None]:
    """Rebuild the isolated test schema from committed migrations."""
    alembic_config = Config(str(BACKEND_ROOT / "alembic.ini"))
    alembic_config.set_main_option("sqlalchemy.url", TEST_DATABASE_URL)
    command.downgrade(alembic_config, "base")
    command.upgrade(alembic_config, "head")
    yield
    command.downgrade(alembic_config, "base")


@pytest.fixture(scope="session")
def database_url() -> str:
    """Expose the isolated database URL to persistence assertions."""
    return TEST_DATABASE_URL


@pytest.fixture
def clean_database(migrated_database: None, database_url: str) -> None:
    """Remove persisted test data while preserving the migrated schema."""
    del migrated_database
    with psycopg.connect(database_url.replace("+psycopg", ""), autocommit=True) as connection:
        tables = connection.execute(
            """
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public' AND tablename != 'alembic_version'
            """
        ).fetchall()
        if tables:
            identifiers = [sql.Identifier(table[0]) for table in tables]
            connection.execute(
                sql.SQL("TRUNCATE TABLE {} RESTART IDENTITY CASCADE").format(
                    sql.SQL(", ").join(identifiers)
                )
            )


@pytest.fixture
def test_settings() -> Settings:
    """Use deterministic credentials and database settings in the test suite."""
    return Settings(
        environment="test",
        database_url=TEST_DATABASE_URL,
        jwt_secret="test-secret-that-is-long-enough-for-automated-tests",
    )


@pytest.fixture
def client(migrated_database: None, test_settings: Settings) -> Iterator[TestClient]:
    """Return an API client configured for the isolated database."""
    del migrated_database
    with TestClient(create_app(test_settings)) as test_client:
        yield test_client


@pytest.fixture
def admin_headers(database_url: str, test_settings: Settings) -> dict[str, str]:
    """Create a persisted administrator and return its signed bearer header."""
    admin = User(
        id=uuid4(),
        full_name="Aretiva Administrator",
        email="admin@aretiva.test",
        password_hash="not-used-by-this-fixture",
        role=UserRole.ADMIN,
    )
    with psycopg.connect(database_url.replace("+psycopg", ""), autocommit=True) as connection:
        connection.execute(
            """
            INSERT INTO users (id, full_name, email, password_hash, role)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (
                str(admin.id),
                admin.full_name,
                admin.email,
                admin.password_hash,
                admin.role.value,
            ),
        )

    return {"Authorization": f"Bearer {create_access_token(admin, test_settings)}"}
