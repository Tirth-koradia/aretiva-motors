"""Shared PostgreSQL-backed API test fixtures."""

import os
from collections.abc import Iterator
from pathlib import Path

import psycopg
import pytest
from alembic.config import Config
from fastapi.testclient import TestClient
from psycopg import sql

from alembic import command
from aretiva.core.config import Settings
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
def client(migrated_database: None) -> Iterator[TestClient]:
    """Return an API client configured for the isolated database."""
    del migrated_database
    settings = Settings(
        environment="test",
        database_url=TEST_DATABASE_URL,
        jwt_secret="test-secret-that-is-long-enough-for-automated-tests",
    )
    with TestClient(create_app(settings)) as test_client:
        yield test_client
