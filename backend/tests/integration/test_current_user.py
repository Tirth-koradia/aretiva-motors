"""Bearer-token authorization behavior."""

from fastapi.testclient import TestClient


def test_authenticated_request_returns_the_current_user(
    client: TestClient,
    clean_database: None,
) -> None:
    del clean_database
    registration_response = client.post(
        "/api/auth/register",
        json={
            "full_name": "Mira Shah",
            "email": "mira.shah@example.com",
            "password": "Aretiva!Pass2026",
        },
    )
    login_response = client.post(
        "/api/auth/login",
        json={
            "email": "mira.shah@example.com",
            "password": "Aretiva!Pass2026",
        },
    )

    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {login_response.json()['access_token']}"},
    )

    assert registration_response.status_code == 201
    assert login_response.status_code == 200
    assert response.status_code == 200
    assert response.json() == {
        "id": registration_response.json()["id"],
        "full_name": "Mira Shah",
        "email": "mira.shah@example.com",
        "role": "customer",
    }


def test_current_user_requires_a_valid_bearer_token(
    client: TestClient,
    clean_database: None,
) -> None:
    del clean_database
    response = client.get("/api/auth/me")

    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"
    assert response.json() == {
        "error": {
            "code": "UNAUTHENTICATED",
            "message": "A valid access token is required.",
        }
    }
