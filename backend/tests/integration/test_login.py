"""Credential-login behavior."""

from fastapi.testclient import TestClient


def test_login_returns_a_bearer_token_and_safe_customer_profile(
    client: TestClient,
    clean_database: None,
) -> None:
    del clean_database
    registration_response = client.post(
        "/api/auth/register",
        json={
            "full_name": "Tirth Koradia",
            "email": "tirth.koradia@example.com",
            "password": "Aretiva!Pass2026",
        },
    )

    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "TIRTH.KORADIA@example.com",
            "password": "Aretiva!Pass2026",
        },
    )

    assert registration_response.status_code == 201
    assert login_response.status_code == 200
    payload = login_response.json()
    assert payload["token_type"] == "bearer"
    assert isinstance(payload["access_token"], str)
    assert len(payload["access_token"]) > 20
    assert payload["user"] == {
        "id": registration_response.json()["id"],
        "full_name": "Tirth Koradia",
        "email": "tirth.koradia@example.com",
        "role": "customer",
    }
    assert "password" not in payload
    assert "password_hash" not in payload


def test_login_rejects_invalid_credentials_without_disclosing_the_reason(
    client: TestClient,
    clean_database: None,
) -> None:
    del clean_database
    response = client.post(
        "/api/auth/login",
        json={
            "email": "nobody@example.com",
            "password": "Aretiva!Pass2026",
        },
    )

    assert response.status_code == 401
    assert response.json() == {
        "error": {
            "code": "INVALID_CREDENTIALS",
            "message": "Email or password is incorrect.",
        }
    }
