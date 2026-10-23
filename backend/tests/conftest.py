"""Shared PostgreSQL-backed API test fixtures."""

import os
from collections.abc import Iterator
from pathlib import Path

import pytest
from alembic.config import Config
from fastapi.testclient import TestClient

from alembic import command
from aretiva.core.config import Settings
from aretiva.main import create_app

BACKEND_ROOT = Path(__file__).parents[1]
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://aretiva:aretiva_dev@localhost:55432/aretiva_test",
)


@pytest.fixture(scope="session", autouse=True)
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
def client() -> Iterator[TestClient]:
    """Return an API client configured for the isolated database."""
    settings = Settings(
        environment="test",
        database_url=TEST_DATABASE_URL,
        jwt_secret="test-secret-that-is-long-enough-for-automated-tests",
    )
    with TestClient(create_app(settings)) as test_client:
        yield test_client
