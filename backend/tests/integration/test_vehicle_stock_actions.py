"""Customer purchase and administrator restock behavior."""

from fastapi.testclient import TestClient


def vehicle_payload() -> dict[str, object]:
    """Return a single-unit vehicle for stock-changing API contracts."""
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
        "quantity": 1,
        "description": "Single-owner sedan with verified service history.",
    }


def customer_headers(client: TestClient) -> dict[str, str]:
    """Create and sign in the customer permitted to purchase vehicles."""
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


def test_customer_purchase_decrements_one_unit_and_returns_confirmation(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    """One completed purchase records the remaining quantity without negative stock."""
    create_response = client.post("/api/vehicles", headers=admin_headers, json=vehicle_payload())
    vehicle_id = create_response.json()["id"]
    headers = customer_headers(client)

    purchase_response = client.post(f"/api/vehicles/{vehicle_id}/purchase", headers=headers)
    detail_response = client.get(f"/api/vehicles/{vehicle_id}", headers=headers)

    assert create_response.status_code == 201
    assert purchase_response.status_code == 201
    assert purchase_response.json()["vehicle_id"] == vehicle_id
    assert purchase_response.json()["quantity_remaining"] == 0
    assert detail_response.json()["quantity"] == 0


def test_only_administrator_can_restock_inventory(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    """A restock is server-side protected and changes available quantity by its requested amount."""
    create_response = client.post("/api/vehicles", headers=admin_headers, json=vehicle_payload())
    vehicle_id = create_response.json()["id"]
    customer_response = client.post(
        f"/api/vehicles/{vehicle_id}/restock",
        headers=customer_headers(client),
        json={"quantity": 2},
    )
    admin_response = client.post(
        f"/api/vehicles/{vehicle_id}/restock",
        headers=admin_headers,
        json={"quantity": 2},
    )

    assert create_response.status_code == 201
    assert customer_response.status_code == 403
    assert admin_response.status_code == 200
    assert admin_response.json()["quantity_remaining"] == 3
