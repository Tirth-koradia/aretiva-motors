# Aretiva Motors

> Engineered through every iteration.

Aretiva Motors is a full-stack vehicle showroom and inventory-management application built as an online internship assessment. The name combines *aretē* (excellence) with iteration — quality earned through continuous refinement.

![CI](https://github.com/Tirth-koradia/aretiva-motors/actions/workflows/ci.yml/badge.svg)
![Backend Tests](https://img.shields.io/badge/Backend%20Tests-20%20passing-emerald?style=flat&logo=pytest)
![Frontend Tests](https://img.shields.io/badge/Frontend%20Tests-9%20passing-emerald?style=flat&logo=vitest)
![Coverage](https://img.shields.io/badge/Test%20Suites-100%25%20Passing-blue?style=flat)
![Architecture](https://img.shields.io/badge/Architecture-Clean%20%2B%20TDD-black?style=flat)

---

## Reviewer Quickstart & Evaluation Guide

Welcome to the Aretiva Motors assessment submission! This section provides direct links, verified credentials, and a guided 3-minute tour of all evaluated requirements.

### Live Environments & API Docs

| Service | Link | Description |
|---|---|---|
| **Live Web Application** | [Aretiva Motors Frontend](https://aretiva-motors-pzpp6ku74-tirthkoradia4-4121s-projects.vercel.app/) | Deployed on Vercel with SPA routing |
| **Interactive API Docs** | [FastAPI Swagger UI](https://aretiva-backend.onrender.com/docs) | Live OpenAPI documentation & interactive explorer on Render |
| **API Health Status** | [`GET /health`](https://aretiva-backend.onrender.com/health) | Production service status & health monitoring |

### 1-Click Demo Credentials

> **Tip:** The `/login` page features **1-Click Reviewer Autofill** buttons that instantly populate verified credentials for both personas without needing to type or copy-paste.

| Persona | Email | Password | Primary Capabilities |
|---|---|---|---|
| **Customer** | `tirth.koradia@example.com` | `Customer1234!` | Browse showroom, multi-param search/refine, purchase vehicles, view purchase history |
| **Administrator** | `admin@aretiva.com` | `ChangeMe123!` | Access inventory desk, create vehicles, restock units, update specs, soft-delete, audit logs |

### 3-Minute Evaluation Tour

1. **Multi-Parameter Filter & Tolerant Search**:
   - Go to `/showroom` and search Make with `mercedes` or `porsche` — matches tolerantly via case-insensitive `ILIKE`.
   - Test category filtering (e.g. `Coupe`, `SUV`), price ranges, and year constraints.
   - Click **Reset** to instantly restore all 13 luxury listings.
2. **Purchase Workflow & Concurrency Protection**:
   - Select any available vehicle (e.g., *Aston Martin Vantage Coupe*).
   - Click **Acquire vehicle** to execute a transactional purchase. Inventory atomically decrements, preventing overselling under concurrency locks (`SELECT ... FOR UPDATE`).
   - Navigate to **Your considerations** (`/purchases`) to review the immutable ledger projection.
3. **Sold-Out Enforcement**:
   - Locate the seeded *Lexus LC 500* (`quantity: 0`). The acquisition CTA is securely disabled and badged as **Sold Out**.
4. **Admin Operations & Restock Flow**:
   - Switch to the Admin account (click **Sign out** → click **Admin Demo**).
   - Enter the **Inventory desk** (`/admin/inventory`) to create new inventory, update vehicle pricing, or restock depleted units.
5. **Interactive OpenAPI Contract**:
   - Visit the [Swagger Documentation](https://aretiva-backend.onrender.com/docs) to inspect live endpoint schemas, request bodies, and responses.

---

## Features

| Layer | Capability |
|---|---|
| **Auth** | JWT registration & login (HS256, Argon2id hashed passwords) |
| **Showroom** | Paginated vehicle catalogue with search, make, price & year filters |
| **Vehicle detail** | Rich detail page with a purchase-confirmation flow |
| **Purchase history** | Private, immutable ledger projection for each customer |
| **Admin inventory** | Create, edit, restock, and soft-delete vehicles |
| **Admin activity** | Paginated transaction ledger (`GET /api/admin/activity`) |
| **RBAC** | `customer` and `admin` roles enforced server-side on every mutation |

---

## Technology

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, React Router v6, TanStack Query v5
- **Backend**: FastAPI, SQLAlchemy async (psycopg 3), Alembic, PostgreSQL 16
- **Testing**: Pytest, Vitest, Testing Library
- **Infrastructure**: Docker Compose, GitHub Actions CI
- **Architecture**: Documented with Mermaid diagrams in [`docs/architecture.md`](./docs/architecture.md) (Topology, ERD, Concurrency Sequence, and RBAC)

---

## Repository structure

```text
aretiva-motors/
├── backend/          FastAPI application and tests
│   ├── src/aretiva/  Application source
│   ├── alembic/      Database migrations
│   └── Dockerfile
├── frontend/         React application and tests
│   ├── src/          Application source
│   └── Dockerfile
├── docs/             Architecture notes and test report
├── compose.yaml      Local PostgreSQL + optional full-stack services
├── PROMPTS.md        Unedited AI-assistance record
└── README.md
```

---

## Quick start

### Prerequisites

- Docker Desktop (or equivalent) — for the PostgreSQL service
- Python 3.12 with `pip`
- Node 20 with `npm`

### 1 — Environment

```bash
cp .env.example .env
# Edit .env if you need to override DB credentials or JWT settings
```

### 2 — Database

```bash
docker compose up -d database
```

The PostgreSQL service is available on **port 55432** (to avoid conflicts with a local Postgres on 5432).

### 3 — Backend

```bash
cd backend
python -m pip install -e '.[dev]'
alembic upgrade head
# Bootstrap the disposable admin account (email/password from .env)
python -m aretiva.cli aretiva-admin --name "Aretiva Administrator"
uvicorn aretiva.main:app --reload
# → http://localhost:8000
```

### 4 — Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 5 — Demo credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@aretiva.com` | `ChangeMe123!` (or see `.env`) |
| Customer | register at `/register` | any password ≥ 8 chars |

> **Note**: Disposable local demo credentials. Real credentials are never committed.

---

## Running the full stack with Docker

```bash
docker compose --profile full up --build
# Frontend → http://localhost:3000
# Backend  → http://localhost:8000
```

---

## Running tests

### Backend

```bash
cd backend
python -m pytest -q
ruff check .
ruff format --check .
```

### Frontend

```bash
cd frontend
npm test -- --run
npm run typecheck
npm run lint
npm run build
```

### Test Coverage Summary

| Test Domain | Runner | Scope / Scenarios Covered | Passing |
|---|---|---|:---:|
| **Authentication & RBAC** | Pytest / Vitest | User registration, password hashing (Argon2id), JWT issuance, customer/admin role gating | **4 / 4** |
| **Catalog & Tolerant Search** | Pytest / Vitest | Paginated catalog, case-insensitive substring `ILIKE` make search, price & year intervals, body styles | **5 / 5** |
| **Pessimistic Concurrency Locking** | Pytest | Race conditions during simultaneous purchases, `SELECT ... FOR UPDATE`, atomic stock decrement | **2 / 2** |
| **Purchase History & Receipts** | Vitest | Immutable customer ledger projection, Certificate of Acquisition modal & print view | **3 / 3** |
| **Admin Inventory Lifecycle** | Pytest / Vitest | Vehicle creation, validation, restock mutations, soft-deletion, audit activity log, low-stock indicators | **4 / 4** |
| **Service Health & Uptime** | Pytest / UptimeRobot | `GET /health` and `HEAD /health` probe handlers | **2 / 2** |
| **Total Automated Tests** | | **Backend (20) + Frontend (9)** | **29 / 29 (100%)** |

See [`docs/test-report.md`](./docs/test-report.md) for detailed test metrics and logs.

---

## API reference (key endpoints)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create a customer account |
| `POST` | `/api/auth/login` | Public | Obtain a signed JWT |
| `GET` | `/api/vehicles` | Customer+ | Paginated vehicle list |
| `GET` | `/api/vehicles/search` | Customer+ | Filtered search |
| `GET` | `/api/vehicles/{id}` | Customer+ | Vehicle detail |
| `POST` | `/api/vehicles` | Admin | Create a vehicle |
| `PUT` | `/api/vehicles/{id}` | Admin | Update a vehicle |
| `DELETE` | `/api/vehicles/{id}` | Admin | Soft-delete a vehicle |
| `POST` | `/api/vehicles/{id}/purchase` | Customer | Purchase one unit |
| `POST` | `/api/vehicles/{id}/restock` | Admin | Add stock |
| `GET` | `/api/purchases` | Customer | Purchase history |
| `GET` | `/api/admin/activity` | Admin | Full inventory activity log |
| `GET` | `/health` | Public | Health check |

---

## Deployment

A complete production deployment guide for deploying the frontend to **Vercel** and the backend + database to **Render** is available in [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md).

- **Render Blueprint:** [`render.yaml`](./render.yaml) provisions the PostgreSQL database and FastAPI service.
- **Vercel Config:** [`frontend/vercel.json`](./frontend/vercel.json) configures SPA rewrite routing.


## My AI Usage

AI is being used as a collaborative engineering tool for requirement analysis, design exploration, implementation support, test review, and documentation. Every AI suggestion is reviewed, adapted, and verified with automated tests before committing.

Development follows a strict **Red → Green → Refactor** TDD discipline:

1. Write an executable failing test and commit it (`[red]`).
2. Implement only what makes it pass and commit it (`[green]`).
3. Refactor and commit separately if material.

Each AI-assisted commit includes:

```text
Co-authored-by: OpenAI Codex <AI@users.noreply.github.com>
```

The full, chronological AI-assistance record (prompts and responses) is maintained in [`PROMPTS.md`](./PROMPTS.md). Secrets, credentials, and private URLs are never included in AI logs or commit messages.
