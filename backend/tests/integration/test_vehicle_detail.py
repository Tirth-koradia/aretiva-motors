"""Authenticated vehicle-detail behavior."""

from uuid import uuid4

from fastapi.testclient import TestClient


def vehicle_payload() -> dict[str, object]:
    """Return a full inventory record for detail-page API contracts."""
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
    }


def customer_headers(client: TestClient) -> dict[str, str]:
    """Create and sign in a customer for the private showroom."""
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


def test_customer_can_view_a_single_active_vehicle(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    """The detail response returns a real inventory vehicle to authenticated customers."""
    create_response = client.post(
        "/api/vehicles",
        headers=admin_headers,
        json=vehicle_payload(),
    )

    response = client.get(
        f"/api/vehicles/{create_response.json()['id']}",
        headers=customer_headers(client),
    )

    assert create_response.status_code == 201
    assert response.status_code == 200
    assert response.json()["vin"] == "1HGCM82633A004352"
    assert response.json()["description"] == "Single-owner sedan with verified service history."


def test_vehicle_detail_returns_a_safe_not_found_response(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    """Missing IDs do not leak internal database behavior."""
    response = client.get(
        f"/api/vehicles/{uuid4()}",
        headers=admin_headers,
    )

    assert response.status_code == 404
    assert response.json() == {
        "error": {
            "code": "VEHICLE_NOT_FOUND",
            "message": "The requested vehicle could not be found.",
        }
    }
