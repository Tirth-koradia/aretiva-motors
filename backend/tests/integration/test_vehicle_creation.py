"""Administrator vehicle-creation behavior."""

from fastapi.testclient import TestClient


def vehicle_payload() -> dict[str, object]:
    """Return a realistic inventory record used by API contracts."""
    return {
        "vin": "1HGCM82633A004352",
        "make": "Honda",
        "model": "City ZX",
        "category": "sedan",
        "condition": "pre_owned",
        "year": 2023,
        "mileage_km": 18420,
        "fuel_type": "petrol",
        "transmission": "automatic",
        "price": "1489000.00",
        "quantity": 2,
        "description": "Single-owner sedan with verified service history.",
        "image_url": "https://images.example.test/honda-city-zx.jpg",
    }


def test_administrator_can_create_a_persistent_vehicle(
    client: TestClient,
    clean_database: None,
    admin_headers: dict[str, str],
) -> None:
    del clean_database
    response = client.post(
        "/api/vehicles",
        headers=admin_headers,
        json=vehicle_payload(),
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["make"] == "Honda"
    assert payload["model"] == "City ZX"
    assert payload["price"] == "1489000.00"
    assert payload["quantity"] == 2
    assert payload["vin"] == "1HGCM82633A004352"
    assert payload["deleted_at"] is None


def test_customer_cannot_create_a_vehicle(
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
            "email": "tirth.koradia@example.com",
            "password": "Aretiva!Pass2026",
        },
    )

    response = client.post(
        "/api/vehicles",
        headers={"Authorization": f"Bearer {login_response.json()['access_token']}"},
        json=vehicle_payload(),
    )

    assert registration_response.status_code == 201
    assert login_response.status_code == 200
    assert response.status_code == 403
    assert response.json() == {
        "error": {
            "code": "FORBIDDEN",
            "message": "You do not have permission to perform this action.",
        }
    }
