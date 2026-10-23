"""Public customer-registration behavior."""

from uuid import UUID

import psycopg
from fastapi.testclient import TestClient


def test_registration_creates_customer_without_exposing_password(
    client: TestClient,
    clean_database: None,
    database_url: str,
) -> None:
    del clean_database
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


def test_registration_rejects_case_insensitive_duplicate_email(
    client: TestClient,
    clean_database: None,
) -> None:
    del clean_database
    first_response = client.post(
        "/api/auth/register",
        json={
            "full_name": "Anika Rao",
            "email": "Anika.Rao@Example.com",
            "password": "Aretiva!Pass2026",
        },
    )

    duplicate_response = client.post(
        "/api/auth/register",
        json={
            "full_name": "Another Anika",
            "email": "anika.rao@example.com",
            "password": "Another!Pass2026",
        },
    )

    assert first_response.status_code == 201
    assert duplicate_response.status_code == 409
    assert duplicate_response.json() == {
        "error": {
            "code": "EMAIL_ALREADY_REGISTERED",
            "message": "An account with this email already exists.",
        }
    }
