"""Admin concierge delivery management integration tests."""

from uuid import uuid4

from fastapi.testclient import TestClient


def sample_vehicle() -> dict[str, object]:
    """Return a vehicle payload for test acquisitions."""
    return {
        "vin": "WP0AF2A97RS273819",
        "make": "Porsche",
        "model": "911 GT3 (992)",
        "category": "coupe",
        "condition": "new",
        "year": 2024,
        "mileage_km": 120,
        "fuel_type": "petrol",
        "transmission": "automatic",
        "price": "27500000.00",
        "quantity": 1,
        "description": "Track-focused naturally aspirated flat-six coupe.",
    }


def register_customer(client: TestClient) -> dict[str, str]:
    """Register and authenticate a customer."""
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


def test_admin_can_list_and_update_delivery_status(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    """Admin can inspect all delivery dispatches and advance their lifecycle state."""
    # 1. Admin creates a vehicle
    create_res = client.post("/api/vehicles", headers=admin_headers, json=sample_vehicle())
    assert create_res.status_code == 201
    vehicle_id = create_res.json()["id"]

    # 2. Customer purchases the vehicle
    cust_headers = register_customer(client)
    purchase_res = client.post(f"/api/vehicles/{vehicle_id}/purchase", headers=cust_headers)
    assert purchase_res.status_code == 201
    tx_id = purchase_res.json()["transaction_id"]

    # 3. Customer checks purchase history - status is 'confirmed'
    history_res = client.get("/api/purchases", headers=cust_headers)
    assert history_res.status_code == 200
    assert history_res.json()["items"][0]["delivery_status"] == "confirmed"

    # 4. Admin lists deliveries
    deliveries_res = client.get("/api/admin/deliveries", headers=admin_headers)
    assert deliveries_res.status_code == 200
    assert deliveries_res.json()["meta"]["total"] >= 1
    found_item = next(
        (item for item in deliveries_res.json()["items"] if item["id"] == tx_id), None
    )
    assert found_item is not None
    assert found_item["delivery_status"] == "confirmed"
    assert found_item["customer_email"] == "tirth.koradia@example.com"
    assert found_item["vehicle_make"] == "Porsche"

    # 5. Admin updates delivery status to 'en_route'
    update_res = client.patch(
        f"/api/admin/deliveries/{tx_id}",
        headers=admin_headers,
        json={"delivery_status": "en_route"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["delivery_status"] == "en_route"

    # 6. Customer immediately sees the updated status in their private record
    updated_history = client.get("/api/purchases", headers=cust_headers)
    assert updated_history.status_code == 200
    assert updated_history.json()["items"][0]["delivery_status"] == "en_route"


def test_customer_cannot_update_delivery_status(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    """Non-administrators are forbidden from altering delivery statuses."""
    create_res = client.post("/api/vehicles", headers=admin_headers, json=sample_vehicle())
    cust_headers = register_customer(client)
    purchase_res = client.post(
        f"/api/vehicles/{create_res.json()['id']}/purchase", headers=cust_headers
    )
    tx_id = purchase_res.json()["transaction_id"]

    forbidden_res = client.patch(
        f"/api/admin/deliveries/{tx_id}",
        headers=cust_headers,
        json={"delivery_status": "handover_ready"},
    )
    assert forbidden_res.status_code == 403


def test_admin_update_nonexistent_delivery_returns_404(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    """Updating a non-existent delivery order returns 404."""
    not_found_res = client.patch(
        f"/api/admin/deliveries/{uuid4()}",
        headers=admin_headers,
        json={"delivery_status": "detailing"},
    )
    assert not_found_res.status_code == 404
