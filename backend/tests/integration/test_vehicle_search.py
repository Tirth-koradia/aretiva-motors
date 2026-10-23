"""Authenticated vehicle search behavior."""

from fastapi.testclient import TestClient


def vehicle_payload(
    vin: str,
    *,
    make: str,
    model: str,
    category: str,
    price: str,
    year: int,
) -> dict[str, object]:
    """Build a realistic inventory record for search contracts."""
    return {
        "vin": vin,
        "make": make,
        "model": model,
        "category": category,
        "condition": "pre_owned",
        "year": year,
        "mileage_km": 18420,
        "fuel_type": "petrol",
        "transmission": "automatic",
        "price": price,
        "quantity": 2,
        "description": "Single-owner vehicle with verified service history.",
    }


def customer_headers(client: TestClient) -> dict[str, str]:
    """Register and sign in a customer to use the private showroom API."""
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


def test_customer_can_filter_and_sort_active_inventory(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    """Search narrows the inventory using case-insensitive filters and controlled ordering."""
    for payload in (
        vehicle_payload(
            "1HGCM82633A004352",
            make="Honda",
            model="City ZX",
            category="sedan",
            price="1489000.00",
            year=2023,
        ),
        vehicle_payload(
            "JHMCM56557C404453",
            make="Honda",
            model="Amaze Elite",
            category="sedan",
            price="899000.00",
            year=2022,
        ),
        vehicle_payload(
            "WAUZZZ8V0JA123456",
            make="Audi",
            model="A4 Premium",
            category="sedan",
            price="3450000.00",
            year=2024,
        ),
    ):
        assert client.post("/api/vehicles", headers=admin_headers, json=payload).status_code == 201

    response = client.get(
        "/api/vehicles/search?make=hOnDa&min_price=800000&max_price=1500000&sort=price_asc",
        headers=customer_headers(client),
    )

    assert response.status_code == 200
    assert response.json()["meta"]["total"] == 2
    assert [vehicle["model"] for vehicle in response.json()["items"]] == [
        "Amaze Elite",
        "City ZX",
    ]
    assert [vehicle["price"] for vehicle in response.json()["items"]] == [
        "899000.00",
        "1489000.00",
    ]
