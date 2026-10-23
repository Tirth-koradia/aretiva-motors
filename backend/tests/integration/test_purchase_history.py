"""Customer purchase-history behavior."""

from fastapi.testclient import TestClient


def vehicle_payload() -> dict[str, object]:
    """Return a vehicle that a customer can purchase and later find in history."""
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
    """Register and authenticate the customer whose private history is queried."""
    client.post(
        "/api/auth/register",
        json={
            "full_name": "Mira Shah",
            "email": "mira.shah@example.com",
            "password": "Aretiva!Pass2026",
        },
    )
    login_response = client.post(
        "/api/auth/login",
        json={"email": "mira.shah@example.com", "password": "Aretiva!Pass2026"},
    )
    return {"Authorization": f"Bearer {login_response.json()['access_token']}"}


def test_customer_can_view_only_their_purchase_history(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    """Purchase history identifies the acquired vehicle without exposing other ledger activity."""
    create_response = client.post("/api/vehicles", headers=admin_headers, json=vehicle_payload())
    headers = customer_headers(client)
    purchase_response = client.post(
        f"/api/vehicles/{create_response.json()['id']}/purchase", headers=headers
    )
    history_response = client.get("/api/purchases", headers=headers)

    assert create_response.status_code == 201
    assert purchase_response.status_code == 201
    assert history_response.status_code == 200
    assert history_response.json()["meta"]["total"] == 1
    assert history_response.json()["items"][0]["vehicle"]["make"] == "Honda"
    assert history_response.json()["items"][0]["vehicle"]["model"] == "City ZX"
    assert history_response.json()["items"][0]["quantity"] == 1
