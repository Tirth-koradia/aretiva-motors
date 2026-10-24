"""PostgreSQL concurrency protection for final-unit purchases."""

from concurrent.futures import ThreadPoolExecutor
from threading import Barrier

from fastapi.testclient import TestClient

from aretiva.core.config import Settings
from aretiva.main import create_app


def vehicle_payload() -> dict[str, object]:
    """Return the one-unit inventory record used for the race condition contract."""
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
    """Create the customer whose token is shared by simultaneous purchase requests."""
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


def test_two_simultaneous_final_unit_purchases_allow_exactly_one_success(
    client: TestClient,
    admin_headers: dict[str, str],
    test_settings: Settings,
) -> None:
    """Conditional PostgreSQL updates preserve non-negative stock under contention."""
    create_response = client.post("/api/vehicles", headers=admin_headers, json=vehicle_payload())
    vehicle_id = create_response.json()["id"]
    headers = customer_headers(client)
    start_barrier = Barrier(2)

    def purchase_once() -> int:
        with TestClient(create_app(test_settings)) as concurrent_client:
            start_barrier.wait(timeout=5)
            return concurrent_client.post(
                f"/api/vehicles/{vehicle_id}/purchase", headers=headers
            ).status_code

    with ThreadPoolExecutor(max_workers=2) as executor:
        outcomes = list(executor.map(lambda _: purchase_once(), range(2)))

    detail_response = client.get(f"/api/vehicles/{vehicle_id}", headers=headers)

    assert create_response.status_code == 201
    assert sorted(outcomes) == [201, 409]
    assert detail_response.status_code == 200
    assert detail_response.json()["quantity"] == 0
