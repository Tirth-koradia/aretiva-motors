"""Public customer-registration behavior."""

from uuid import UUID

import psycopg
from fastapi.testclient import TestClient


def test_registration_creates_customer_without_exposing_password(
    client: TestClient,
    database_url: str,
) -> None:
    password = "Aretiva!Pass2026"

    response = client.post(
        "/api/auth/register",
        json={
            "full_name": "Mira Shah",
            "email": "mira.shah@example.com",
            "password": password,
        },
    )

    assert response.status_code == 201
    payload = response.json()
    UUID(payload["id"])
    assert payload["full_name"] == "Mira Shah"
    assert payload["email"] == "mira.shah@example.com"
    assert payload["role"] == "customer"
    assert "password" not in payload
    assert "password_hash" not in payload

    with psycopg.connect(database_url.replace("+psycopg", "")) as connection:
        saved_user = connection.execute(
            "SELECT email, role, password_hash FROM users WHERE id = %s",
            (payload["id"],),
        ).fetchone()

    assert saved_user is not None
    assert saved_user[0] == "mira.shah@example.com"
    assert saved_user[1] == "customer"
    assert saved_user[2] != password
    assert saved_user[2].startswith("$argon2")
