"""Authenticated showroom inventory behavior."""

from fastapi.testclient import TestClient


def vehicle_payload(vin: str, model: str) -> dict[str, object]:
    """Return a valid vehicle while making each persisted record distinct."""
    return {
        "vin": vin,
        "make": "Honda",
        "model": model,
        "category": "sedan",
        "condition": "pre_owned",
        "year": 2023,
        "mileage_km": 18420,
        "fuel_type": "petrol",
        "transmission": "automatic",
        "price": "1489000.00",
        "quantity": 2,
        "description": "Single-owner sedan with verified service history.",
    }


def customer_headers(client: TestClient) -> dict[str, str]:
    """Create a showroom customer and return its authenticated request header."""
    client.post(
        "/api/auth/register",
        json={
            "full_name": "Tirth Koradia",
            "email": "tirth.koradia@example.com",
            "password": "Aretiva!Pass2026",
        },
    )
    login_response = client.post(
        "/api/auth/login",
        json={"email": "tirth.koradia@example.com", "password": "Aretiva!Pass2026"},
    )
    return {"Authorization": f"Bearer {login_response.json()['access_token']}"}


def test_authenticated_customer_can_page_through_active_inventory(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    """Showroom returns only active vehicles with server-side pagination metadata."""
    first_create = client.post(
        "/api/vehicles",
        headers=admin_headers,
        json=vehicle_payload("1HGCM82633A004352", "City ZX"),
    )
    second_create = client.post(
        "/api/vehicles",
        headers=admin_headers,
        json=vehicle_payload("WAUZZZ8V0JA123456", "A4 Premium"),
    )

    response = client.get(
        "/api/vehicles?page=1&page_size=1",
        headers=customer_headers(client),
    )

    assert first_create.status_code == 201
    assert second_create.status_code == 201
    assert response.status_code == 200
    assert response.json()["meta"] == {
        "page": 1,
        "page_size": 1,
        "total": 2,
        "total_pages": 2,
    }
    assert len(response.json()["items"]) == 1
    assert response.json()["items"][0]["deleted_at"] is None


def test_inventory_listing_requires_an_authenticated_user(client: TestClient) -> None:
    """The private showroom inventory is unavailable to anonymous visitors."""
    response = client.get("/api/vehicles")

    assert response.status_code == 401
    assert response.json() == {
        "error": {
            "code": "UNAUTHENTICATED",
            "message": "A valid access token is required.",
        }
    }
