# Aretiva Motors — System Architecture & Design

> Engineered through every iteration.

This document describes the architectural topology, data models, concurrency control mechanisms, and security boundaries implemented in Aretiva Motors.

---

## 1. System & Deployment Topology

Aretiva Motors is built as a clean, decoupled full-stack architecture separated into a modern single-page frontend (Vercel) and an asynchronous REST API backend with ACID-compliant storage (Render & PostgreSQL).

```mermaid
graph TB
    subgraph Client ["Client Tier (Browser)"]
        UI["React 18 SPA (Vite + TS)"]
        Query["TanStack Query (Cache & State)"]
        Router["React Router v6 (URL State)"]
        UI --> Query
        UI --> Router
    end

    subgraph Edge ["Edge Tier (Vercel)"]
        VercelCDN["Vercel Global CDN"]
        Rewrites["SPA Fallback Routing"]
        VercelCDN --> Rewrites
    end

    subgraph BackendTier ["Compute Tier (Render)"]
        FastAPI["FastAPI Async API (Uvicorn)"]
        AuthMiddleware["JWT Authentication & RBAC"]
        Pydantic["Pydantic v2 Contract Validation"]
        ServiceLayer["Domain Services (ACID Transactions)"]
        
        FastAPI --> AuthMiddleware
        AuthMiddleware --> Pydantic
        Pydantic --> ServiceLayer
    end

    subgraph DataTier ["Data Tier (PostgreSQL 16)"]
        Engine["SQLAlchemy 2.0 Async (Psycopg 3)"]
        Alembic["Alembic Migrations"]
        Tables[("PostgreSQL Tables & Indexes")]
        
        ServiceLayer --> Engine
        Engine --> Tables
        Alembic -.-> Tables
    end

    subgraph Observability ["Health & Availability"]
        Uptime["UptimeRobot (HEAD /health Probe)"]
        Uptime -->|Interval ping| FastAPI
    end

    UI -->|HTTPS / JSON| VercelCDN
    UI -->|API Requests + JWT| FastAPI
```

---

## 2. Domain Data Model & Entity Relationships

The domain model guarantees immutability for past customer transactions while enforcing soft-deletion and strict audit trails for administrative inventory management.

```mermaid
erDiagram
    USERS ||--o{ PURCHASES : places
    USERS ||--o{ INVENTORY_ACTIVITY : performs
    VEHICLES ||--o{ PURCHASES : "acquired via"
    VEHICLES ||--o{ INVENTORY_ACTIVITY : "logged under"

    USERS {
        uuid id PK
        string email UK "Indexed, normalized lowercase"
        string password_hash "Argon2id cryptographic hash"
        string full_name
        string role "customer | admin"
        timestamp created_at
        timestamp updated_at
    }

    VEHICLES {
        uuid id PK
        string vin UK "17-char Vehicle Identification Number"
        string make "Indexed for ILIKE search"
        string model "Indexed for ILIKE search"
        string category "sedan, suv, coupe, convertible, wagon"
        string condition "new | pre_owned"
        integer year "Manufacture year"
        integer mileage_km "Odometer reading"
        string fuel_type "petrol, diesel, electric, hybrid"
        string transmission "automatic, manual"
        decimal price "Fixed-point numeric currency"
        integer quantity "Stock count (locked on mutation)"
        string image_url "Optional CDN photography asset"
        timestamp deleted_at "Soft-delete tombstone"
        timestamp created_at
        timestamp updated_at
    }

    PURCHASES {
        uuid id PK
        uuid user_id FK "References USERS(id)"
        uuid vehicle_id FK "References VEHICLES(id)"
        integer quantity "Default 1 unit"
        decimal price_at_purchase "Historical price snapshot"
        timestamp purchased_at "Immutable UTC timestamp"
    }

    INVENTORY_ACTIVITY {
        uuid id PK
        uuid vehicle_id FK "References VEHICLES(id)"
        uuid admin_user_id FK "References USERS(id)"
        string action "created, updated, restocked, removed"
        integer quantity_change "Delta in inventory count"
        integer previous_quantity "Audit baseline"
        integer new_quantity "Post-mutation balance"
        string notes "Contextual mutation log"
        timestamp created_at "Immutable UTC timestamp"
    }
```

---

## 3. Concurrency & Pessimistic Locking Sequence

To eliminate overselling race conditions when multiple customers simultaneously request the final available unit of an exotic vehicle, Aretiva implements **Pessimistic Row-Level Locking** using PostgreSQL's `SELECT ... FOR UPDATE`.

```mermaid
sequenceDiagram
    autonumber
    actor Alice as Customer Alice
    actor Bob as Customer Bob
    participant API as FastAPI Backend
    participant DB as PostgreSQL Database

    Note over Alice,Bob: Vehicle X has exactly quantity = 1

    par Simultaneous Purchase Requests
        Alice->>API: POST /api/vehicles/{id}/purchase
        Bob->>API: POST /api/vehicles/{id}/purchase
    end

    critical Database Transaction A (Alice)
        API->>DB: BEGIN TRANSACTION (Alice)
        API->>DB: SELECT * FROM vehicles WHERE id = X FOR UPDATE
        Note over DB: Row locked by Alice's transaction.<br/>Bob's lock request blocks until release.
        DB-->>API: Row acquired (quantity = 1)
        API->>DB: UPDATE vehicles SET quantity = 0 WHERE id = X
        API->>DB: INSERT INTO purchases (user_id, vehicle_id, quantity)
        API->>DB: COMMIT TRANSACTION
        Note over DB: Lock released. Quantity is now 0.
    end
    API-->>Alice: HTTP 201 Created (Order Confirmed)

    critical Database Transaction B (Bob)
        Note over DB: Bob's lock succeeds after Alice commits.
        DB-->>API: Row acquired (quantity = 0)
        API->>API: Evaluate condition: quantity (0) <= 0
        API->>DB: ROLLBACK TRANSACTION
    end
    API-->>Bob: HTTP 409 Conflict ("Vehicle is out of stock")
```

---

## 4. Role-Based Access Control (RBAC) & Security Boundary

Every mutation route in the system enforces strict zero-trust claims verification. Tokens are cryptographically validated against `JWT_SECRET` (HS256) with verified issuer and audience claims.

```mermaid
flowchart TD
    Req([Incoming HTTP Request]) --> AuthCheck{Bearer Token Present?}
    
    AuthCheck -- No --> PublicRoute{Is Route Public?}
    PublicRoute -- Yes: /login, /register, /health --> Handler[Execute Route Handler]
    PublicRoute -- No --> Err401[HTTP 401 Unauthorized]
    
    AuthCheck -- Yes --> Decrypt[Decode & Verify JWT Claims]
    Decrypt --> Expired{Token Expired or Invalid?}
    Expired -- Yes --> Err401
    
    Expired -- No --> RoleCheck{Required Role?}
    RoleCheck -- Any Authenticated --> CustomerAllowed[Allow Access]
    RoleCheck -- Admin Only --> VerifyAdmin{Claims role == 'admin'?}
    
    VerifyAdmin -- Yes --> AllowAdmin[Grant Access to Inventory Desk / Audit]
    VerifyAdmin -- No --> Err403[HTTP 403 Forbidden]
    
    CustomerAllowed --> Handler
    AllowAdmin --> Handler
```

---

## 5. Architectural Correctness Guarantees

1. **No Negative Stock**:
   Stock can never drop below zero. Every purchase is conditionally guarded within a pessimistic lock.
2. **Auditable Inventory State**:
   Direct vehicle attribute updates (e.g. price, description) are structurally separated from stock mutations (restock, purchase), ensuring every unit change leaves an immutable trace in the `inventory_activity` ledger.
3. **Soft Deletions**:
   Deleting a vehicle preserves referential integrity for previous purchase receipts and audit records by setting `deleted_at = NOW()` rather than destructive `DELETE`.
4. **Resilient Production Probes**:
   The API provides explicit support for both `GET /health` and `HEAD /health` protocols to support third-party ping monitors (like UptimeRobot) without generating 405 Method Not Allowed errors.
