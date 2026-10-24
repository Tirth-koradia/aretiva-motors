"""Administrator inventory-management behavior."""

from fastapi.testclient import TestClient


def vehicle_payload(*, price: str = "1489000.00", quantity: int = 2) -> dict[str, object]:
    """Return a complete valid vehicle payload for administrator actions."""
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
        "price": price,
        "quantity": quantity,
        "description": "Single-owner sedan with verified service history.",
    }


def customer_headers(client: TestClient) -> dict[str, str]:
    """Create and sign in a customer whose role is not administrator."""
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


def test_administrator_can_update_and_soft_delete_a_vehicle(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    """Management edits persist, then deletion removes the vehicle from the showroom."""
    create_response = client.post("/api/vehicles", headers=admin_headers, json=vehicle_payload())
    vehicle_id = create_response.json()["id"]

    update_response = client.put(
        f"/api/vehicles/{vehicle_id}",
        headers=admin_headers,
        json=vehicle_payload(price="1399000.00", quantity=3),
    )
    delete_response = client.delete(f"/api/vehicles/{vehicle_id}", headers=admin_headers)
    detail_response = client.get(f"/api/vehicles/{vehicle_id}", headers=admin_headers)

    assert create_response.status_code == 201
    assert update_response.status_code == 200
    assert update_response.json()["price"] == "1399000.00"
    assert update_response.json()["quantity"] == 3
    assert delete_response.status_code == 204
    assert detail_response.status_code == 404


def test_customer_cannot_update_or_delete_inventory(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    """The client-side dashboard is backed by server-enforced admin authorization."""
    create_response = client.post("/api/vehicles", headers=admin_headers, json=vehicle_payload())
    vehicle_id = create_response.json()["id"]
    headers = customer_headers(client)

    update_response = client.put(
        f"/api/vehicles/{vehicle_id}", headers=headers, json=vehicle_payload()
    )
    delete_response = client.delete(f"/api/vehicles/{vehicle_id}", headers=headers)

    assert update_response.status_code == 403
    assert delete_response.status_code == 403
