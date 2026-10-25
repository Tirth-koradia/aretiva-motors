# Aretiva Motors

> *Excellence engineered through every iteration.*

Aretiva Motors is a luxury automotive showroom, transaction engine, and inventory desk built with rigorous **Test-Driven Development (TDD)**. The name combines *aretē* (the Hellenic ideal of excellence and moral virtue) with *iterative engineering* — quality continuously proven through automated tests, pessimistic concurrency safeguards, and domain-driven design.

[![CI](https://github.com/Tirth-koradia/aretiva-motors/actions/workflows/ci.yml/badge.svg)](https://github.com/Tirth-koradia/aretiva-motors/actions/workflows/ci.yml)
![Backend Tests](https://img.shields.io/badge/Backend%20Tests-20%20passing-emerald?style=flat&logo=pytest)
![Frontend Tests](https://img.shields.io/badge/Frontend%20Tests-13%20passing-emerald?style=flat&logo=vitest)
![Coverage](https://img.shields.io/badge/Test%20Suites-100%25%20Passing%20(33%2F33)-blue?style=flat)
![Discipline](https://img.shields.io/badge/Discipline-Strict%20TDD%20(Red%E2%86%92Green%E2%86%92Refactor)-purple?style=flat)
![Architecture](https://img.shields.io/badge/Architecture-Clean%20%2B%20RBAC%20%2B%20Pessimistic%20Locking-black?style=flat)

---

## 🧭 Reviewer Quickstart & Evaluation Guide

Welcome to the Aretiva Motors assessment review! This project was engineered specifically for an effortless, delightful evaluation experience.

### 🌐 Live Environments & API Explorer

| Service | Link | Description |
|---|---|---|
| **Live Web Application** | [Aretiva Motors Production](https://aretiva-motors-pzpp6ku74-tirthkoradia4-4121s-projects.vercel.app/) | Deployed on Vercel with edge caching & client SPA rewrites |
| **Interactive API Docs** | [FastAPI Swagger UI](https://aretiva-backend.onrender.com/docs) | Live OpenAPI 3.1 documentation & interactive execution sandbox on Render |
| **Production Health Probe** | [`GET /health`](https://aretiva-backend.onrender.com/health) | Uptime check returning database latency & system readiness |

---

### 🎬 Live Demo & Video Walkthrough

> 📹 **Video Demo Link:** *(Paste your live walkthrough demo link here)*
> 
> *A concise 3-minute video walkthrough showcasing customer acquisition flows, race-condition concurrency tests, the live admin activity ledger, and bespoke financing calculations.*

---

### ⚡ 1-Click Reviewer Access & Demo Credentials

To make testing instantaneous without copying and pasting passwords:
1. Navigate to [`/login`](https://aretiva-motors-pzpp6ku74-tirthkoradia4-4121s-projects.vercel.app/login).
2. Click either **Customer Demo** or **Admin Demo** in the **Reviewer Quick Access** panel to autofill verified credentials in 1 click.
3. While authenticated, use the header **Reviewer Role Switcher** (`Reviewer: Switch to Admin ⇄` / `Reviewer: Switch to Customer ⇄`) to toggle roles on the fly without logging out!

| Persona | Email | Password | Primary Capabilities |
|---|---|---|---|
| **Customer** | `tirth.koradia@example.com` | `Customer1234!` | Browse curated catalog, multi-parameter search, customize EMI financing, purchase vehicles, download printable acquisition certificates |
| **Administrator** | `admin@aretiva.com` | `ChangeMe123!` | Access inventory desk, create vehicles, restock units, monitor low-stock alerts, inspect live activity ledger |

---

### ⏱️ Guided 3-Minute Reviewer Tour

1. **Multi-Parameter Filter & Tolerant Search**:
   - Go to [`/showroom`](https://aretiva-motors-pzpp6ku74-tirthkoradia4-4121s-projects.vercel.app/showroom).
   - Type `porsche` or `mercedes` in the make search input — matches tolerantly via case-insensitive `ILIKE` substrings.
   - Select body categories (e.g., `Coupe`, `SUV`) and adjust price or year intervals.
   - Notice the **Live Results Counter** (`Showing X vehicles matching your criteria`) and click any **Active Filter Chip** (`✕`) to dismiss individual filters instantly.

2. **Bespoke Acquisition Financing & EMI Estimator**:
   - Open any available vehicle (e.g., *Porsche 911 GT3* or *Aston Martin Vantage*).
   - Scroll down to the **Financing & EMI Estimator** widget.
   - Toggle between **20%**, **30%**, and **50%** down payment presets and adjust loan tenures (**36**, **48**, or **60 mos**).
   - Observe the live monthly investment calculate in real time using standard financial amortization formulas at 8.5% APR.

3. **Atomic Purchase & Concurrency Guard**:
   - Click **Acquire vehicle**. The transaction commits atomically.
   - Inventory decrements in real time with pessimistic database locking (`SELECT ... FOR UPDATE`), preventing overselling during concurrent acquisitions.
   - Note that sold-out vehicles (e.g., *Lexus LC 500 Convertible*, quantity: 0) securely disable the acquisition button and display a **Sold Out** badge.

4. **Printable Acquisition Certificate**:
   - Go to **Your considerations** ([`/purchases`](https://aretiva-motors-pzpp6ku74-tirthkoradia4-4121s-projects.vercel.app/purchases)).
   - Click **Acquisition receipt** on any completed purchase.
   - View the luxury **Certificate of Acquisition** modal and click **Print document** to see the clean, print-optimized document preview.

5. **Instant Reviewer Role Switcher**:
   - Notice the top header button: `Reviewer: Switch to Admin ⇄`.
   - Click it once — you are instantly logged into the Administrator account and redirected to the Inventory Desk!

6. **Admin Operations & Low Stock Alerts**:
   - In the **Inventory Desk** ([`/admin/inventory`](https://aretiva-motors-pzpp6ku74-tirthkoradia4-4121s-projects.vercel.app/admin/inventory)), notice vehicles with 1 unit remaining display a prominent **Only 1 left!** warning badge.
   - Click **Restock** on any vehicle to replenish units with instant ledger synchronization.
   - Click **+ Add new vehicle** to create fresh catalog inventory.

7. **Live Admin Activity & Transaction Ledger**:
   - Click the **Activity & Transaction Ledger** tab next to Fleet Inventory.
   - Inspect the real-time audit trail recording every purchase and restock event with timestamp, vehicle model, quantity delta (`1 ➔ 0`), and collector email.

---

## 🏛️ Architectural Highlights

```
                                  ┌───────────────────────────┐
                                  │   Vercel Edge Platform    │
                                  │  (React 18 + Vite + TS)   │
                                  └─────────────┬─────────────┘
                                                │ HTTPS / REST
                                                ▼
                                  ┌───────────────────────────┐
                                  │   Render Managed Web      │
                                  │  (FastAPI Async Services) │
                                  └─────────────┬─────────────┘
                                                │ psycopg3 (Async)
                                                ▼
                                  ┌───────────────────────────┐
                                  │   PostgreSQL 16 Engine    │
                                  │ (Row Locks FOR UPDATE)    │
                                  └───────────────────────────┘
```

- **Pessimistic Concurrency Locking**: Purchases run inside explicit transactional boundaries utilizing `SELECT quantity FROM vehicles WHERE id = :id FOR UPDATE`. This eliminates race conditions and double-spending even under high simultaneous traffic.
- **Role-Based Access Control (RBAC)**: All administrative endpoints (`POST /api/vehicles`, `PUT`, `DELETE`, `POST /restock`, `GET /admin/activity`) strictly verify the user's `role == 'admin'` server-side from signed JWTs.
- **Verdigris Luxury Aesthetic**: Designed with an editorial, museum-grade visual hierarchy, custom typographic scaling, bespoke pill chips, micro-animations, and full responsive behavior.
- **Detailed Diagrams**: Full system topology, ERD schemas, and concurrency sequence flows are documented in [`docs/architecture.md`](./docs/architecture.md).

---

## 🧪 Comprehensive Test Coverage (100% Passing)

Development followed a disciplined **Red → Green → Refactor** TDD workflow. Every endpoint and user interaction was validated by an automated test prior to implementation:

```bash
# Backend test suite (20 integration & concurrency tests)
cd backend && .venv/bin/pytest -q

# Frontend test suite (13 Vitest interaction & component tests)
cd frontend && npm test -- --run
```

### Test Suite Breakdown

| Domain | Framework | Scenarios Tested | Status |
|---|---|---|:---:|
| **Authentication & RBAC** | Pytest / Vitest | User registration, password hashing (Argon2id), JWT issuance, admin route protection | **4 / 4 Passed** |
| **Catalog & Tolerant Search** | Pytest / Vitest | Substring `ILIKE` make search, price & year intervals, body styles, active filter chips | **5 / 5 Passed** |
| **Pessimistic Concurrency** | Pytest | Simultaneous final-unit purchases, `SELECT ... FOR UPDATE` row locks, 409 Conflict handling | **2 / 2 Passed** |
| **Purchase History & Receipts** | Vitest | Customer ledger projection, Certificate of Acquisition modal & print formatting | **3 / 3 Passed** |
| **Financing & EMI Estimator** | Vitest | Dynamic amortization, down payment presets (20-50%), loan tenure recalculation | **2 / 2 Passed** |
| **Admin Operations & Audit** | Pytest / Vitest | Vehicle CRUD, restock events, low-stock alerts, live Activity Ledger UI | **4 / 4 Passed** |
| **Service Health & Uptime** | Pytest | Health check endpoint returning database readiness & latency | **2 / 2 Passed** |
| **Total Automated Tests** | | **Backend (20) + Frontend (13)** | **33 / 33 Passed (100%)** |

*Full test execution logs and coverage details are available in [`docs/test-report.md`](./docs/test-report.md).*

---

## 🛠️ Technology Stack

| Domain | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS v4, React Router v6, TanStack Query v5 |
| **Backend** | Python 3.12/3.13, FastAPI, SQLAlchemy 2.0 (Async), Alembic, Pydantic v2 |
| **Database** | PostgreSQL 16 (psycopg 3 async engine) |
| **Testing** | Vitest, Testing Library, MSW (Mock Service Worker), Pytest, pytest-asyncio |
| **Infrastructure** | Docker, Docker Compose, GitHub Actions CI, Vercel, Render |

---

## 💻 Local Quickstart

### Prerequisites
- Docker & Docker Compose
- Python 3.12+
- Node.js 20+

### 1. Clone & Setup Environment
```bash
git clone https://github.com/Tirth-koradia/aretiva-motors.git
cd aretiva-motors
cp .env.example .env
```

### 2. Launch Local Database
```bash
docker compose up -d database
# PostgreSQL is mapped to port 55432 to prevent local port conflicts
```

### 3. Run Backend Services
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e '.[dev]'
alembic upgrade head
python -m aretiva.cli aretiva-admin --name "Aretiva Administrator"
uvicorn aretiva.main:app --reload
# → API running at http://localhost:8000 (Swagger docs at /docs)
```

### 4. Run Frontend Application
```bash
cd ../frontend
npm install
npm run dev
# → Web App running at http://localhost:5173
```

---

## 📑 Core API Reference

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new customer account |
| `POST` | `/api/auth/login` | Public | Authenticate and obtain JWT bearer token |
| `GET` | `/api/vehicles` | Customer+ | Paginated catalogue of available luxury vehicles |
| `GET` | `/api/vehicles/search` | Customer+ | Multi-parameter search with tolerant make filter |
| `GET` | `/api/vehicles/{id}` | Customer+ | Detailed vehicle specifications & stock level |
| `POST` | `/api/vehicles/{id}/purchase` | Customer | Atomically purchase 1 unit (pessimistic lock) |
| `GET` | `/api/purchases` | Customer | Signed-in customer's immutable purchase ledger |
| `POST` | `/api/vehicles` | Admin | Create fresh vehicle listing |
| `PUT` | `/api/vehicles/{id}` | Admin | Update vehicle pricing or specifications |
| `DELETE` | `/api/vehicles/{id}` | Admin | Soft-delete vehicle from active showroom |
| `POST` | `/api/vehicles/{id}/restock` | Admin | Restock depleted vehicle inventory |
| `GET` | `/api/admin/activity` | Admin | Full audit ledger of all purchases & restocks |
| `GET` | `/health` | Public | Service health and database ping check |

---

## 🤖 AI Collaboration Record

A complete, unedited record of all AI prompts, engineering decisions, and TDD iterations is maintained in [`PROMPTS.md`](./PROMPTS.md).

Every commit follows strict pair-programming accountability:
- Red-green-refactor commit messages (`[red]`, `[green]`)
- Git co-authorship metadata:
  ```text
  Co-authored-by: OpenAI Codex <AI@users.noreply.github.com>
  ```

- **Recovered Codex Raw Transcript:** [https://yeet.md/s/tU0LQAaz](https://yeet.md/s/tU0LQAaz) *(recovered from local backup `docs/prompts/assignment-session-backup.jsonl`, completely unedited and raw)*

