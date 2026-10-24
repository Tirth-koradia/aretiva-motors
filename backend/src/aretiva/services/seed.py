"""Curated demo catalog for the Aretiva Motors showroom."""

from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from aretiva.db.models.vehicle import Vehicle

DEMO_VEHICLES = [
    {
        "vin": "WP0AC2A98NS298101",
        "make": "Porsche",
        "model": "911 GT3 (992)",
        "category": "coupe",
        "condition": "new",
        "year": 2024,
        "mileage_km": 120,
        "fuel_type": "petrol",
        "transmission": "automatic",
        "price": Decimal("225000.00"),
        "quantity": 3,
        "description": (
            "Naturally aspirated 4.0L flat-six producing 502 hp. Finished in British Racing Green "
            "with satin Neodyme lightweight forged wheels, front-axle lift, and carbon-ceramic "
            "brakes."
        ),
        "image_url": "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "vin": "SCFRMFAW1KGL01822",
        "make": "Aston Martin",
        "model": "Vantage Coupe",
        "category": "coupe",
        "condition": "new",
        "year": 2024,
        "mileage_km": 85,
        "fuel_type": "petrol",
        "transmission": "automatic",
        "price": Decimal("198000.00"),
        "quantity": 2,
        "description": (
            "Twin-turbo 4.0L V8 delivering 656 hp with a top speed of 202 mph. Handcrafted "
            "obsidian black Bridge of Weir leather with contrast lime stitching and 21-inch wheels."
        ),
        "image_url": "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "vin": "WDD1903821A049811",
        "make": "Mercedes-Benz",
        "model": "AMG GT Black Series",
        "category": "coupe",
        "condition": "pre_owned",
        "year": 2023,
        "mileage_km": 2400,
        "fuel_type": "petrol",
        "transmission": "automatic",
        "price": Decimal("325000.00"),
        "quantity": 1,
        "description": (
            "Extreme track-focused supercar with 720 hp flat-plane crankshaft twin-turbo V8, "
            "active carbon-fiber aerodynamics, and AMG Track Package roll cage."
        ),
        "image_url": "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "vin": "WBAAE8C54MCH92817",
        "make": "BMW",
        "model": "M8 Gran Coupe Competition",
        "category": "sedan",
        "condition": "new",
        "year": 2024,
        "mileage_km": 250,
        "fuel_type": "petrol",
        "transmission": "automatic",
        "price": Decimal("145000.00"),
        "quantity": 4,
        "description": (
            "617 hp 4.4L M TwinPower Turbo V8 paired with rear-biased M xDrive all-wheel drive, "
            "carbon-fiber roof, and full Merino leather upholstery."
        ),
        "image_url": "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "vin": "WAUZZZFW8MA028391",
        "make": "Audi",
        "model": "RS e-tron GT",
        "category": "sedan",
        "condition": "new",
        "year": 2024,
        "mileage_km": 90,
        "fuel_type": "electric",
        "transmission": "automatic",
        "price": Decimal("152000.00"),
        "quantity": 2,
        "description": (
            "All-electric grand tourer with dual synchronous motors delivering 637 hp in boost "
            "mode, 800-volt high-speed charging architecture, and matrix LED laser lights."
        ),
        "image_url": "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "vin": "SALWR2V42NA819203",
        "make": "Land Rover",
        "model": "Defender 110 V8",
        "category": "suv",
        "condition": "new",
        "year": 2024,
        "mileage_km": 410,
        "fuel_type": "petrol",
        "transmission": "automatic",
        "price": Decimal("118000.00"),
        "quantity": 3,
        "description": (
            "Supercharged 518 hp 5.0L V8 with quad outboard exhaust pipes, electronic active "
            "rear differential, 22-inch satin dark grey wheels, and Ebony Windsor leather."
        ),
        "image_url": "https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "vin": "WP0BC2Y14PSA91823",
        "make": "Porsche",
        "model": "Taycan Cross Turismo",
        "category": "suv",
        "condition": "new",
        "year": 2024,
        "mileage_km": 320,
        "fuel_type": "electric",
        "transmission": "automatic",
        "price": Decimal("138000.00"),
        "quantity": 2,
        "description": (
            "Off-road design package with Gravel Mode, 93.4 kWh Performance Battery Plus, "
            "adaptive air suspension with Smart Lift, and full panoramic glass roof."
        ),
        "image_url": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "vin": "ZFF94NLA5P0293817",
        "make": "Ferrari",
        "model": "Roma Spider",
        "category": "convertible",
        "condition": "new",
        "year": 2024,
        "mileage_km": 180,
        "fuel_type": "petrol",
        "transmission": "automatic",
        "price": Decimal("285000.00"),
        "quantity": 1,
        "description": (
            "Front-mid-engine 3.9L twin-turbo V8 producing 612 hp. Equipped with bespoke 5-layer "
            "fabric soft top deployable at up to 60 km/h, passenger display, and carbon-ceramic "
            "brakes."
        ),
        "image_url": "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "vin": "WAUZZZF28NA091827",
        "make": "Audi",
        "model": "RS6 Avant Performance",
        "category": "van",
        "condition": "pre_owned",
        "year": 2023,
        "mileage_km": 11200,
        "fuel_type": "petrol",
        "transmission": "automatic",
        "price": Decimal("129000.00"),
        "quantity": 2,
        "description": (
            "Twin-turbo 4.0L V8 high-performance estate delivering 621 hp in Mythos Black Metallic "
            "with carbon optic package, sport exhaust, and Valcona leather honeycomb seats."
        ),
        "image_url": "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1200&q=80",
    },
    {
        "vin": "JTHHZ5EC2P5019284",
        "make": "Lexus",
        "model": "LC 500 Convertible",
        "category": "convertible",
        "condition": "pre_owned",
        "year": 2022,
        "mileage_km": 8400,
        "fuel_type": "petrol",
        "transmission": "automatic",
        "price": Decimal("96000.00"),
        "quantity": 0,
        "description": (
            "Naturally aspirated 5.0L V8 producing 471 hp in Structural Blue with semi-aniline "
            "leather. Currently sold out — displayed for custom acquisition and waitlist inquiries."
        ),
        "image_url": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
    },
]


async def seed_demo_vehicles(session: AsyncSession) -> int:
    """Insert catalog demo vehicles if not already present."""
    inserted = 0
    for data in DEMO_VEHICLES:
        existing = await session.execute(select(Vehicle).where(Vehicle.vin == data["vin"]))
        if existing.scalar_one_or_none() is None:
            vehicle = Vehicle(**data)
            session.add(vehicle)
            inserted += 1

    if inserted > 0:
        await session.commit()
    return inserted
