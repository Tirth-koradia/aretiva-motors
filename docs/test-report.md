# Test report

This report records all automated quality checks for Aretiva Motors.

## Test layers

| Layer | Tooling | Purpose |
| --- | --- | --- |
| Backend integration | Pytest | Domain rules, authentication, authorization, API contracts, database behavior |
| Frontend interaction | Vitest + Testing Library | User-visible behavior, forms, accessibility, and failure states |
| Static checks | Ruff + TypeScript + ESLint | Formatting, linting, and type safety |

## High-risk scenarios

- Public registration cannot grant administrator access.
- Customers cannot call administrator-only operations.
- Two simultaneous purchases of the final unit produce exactly one `201` and one `409`.
- Failed purchases never decrement inventory or create history records.
- Vehicle quantity never becomes negative.

## Final results

| Check | Result | Detail |
| --- | --- | --- |
| Backend integration suite | ✅ Pass | 24 passed, 0 failed — isolated `aretiva_test` PostgreSQL, including real-Postgres concurrency test, duplicate VIN safeguards, and admin delivery lifecycle management |
| Backend static checks | ✅ Pass | `ruff check` and `ruff format --check` — 0 errors |
| Frontend interaction suite | ✅ Pass | 16 passed, 0 failed across 7 suites — Vitest + Testing Library |
| Frontend static checks | ✅ Pass | TypeScript `noEmit` and ESLint — 0 errors |
| Frontend production build | ✅ Pass | Vite production bundle builds cleanly |
| CI pipeline | ✅ Pass | GitHub Actions runs both suites on every push to `main` |

## Backend test breakdown

| File | Suite | Count |
| --- | --- | --- |
| `tests/test_health.py` | Health endpoint | 1 |
| `tests/test_auth.py` | Registration & login | 5 |
| `tests/test_vehicles.py` | Vehicle CRUD, search, pagination, duplicate VIN prevention | 8 |
| `tests/test_purchases.py` | Purchase, restock, purchase history | 5 |
| `tests/test_concurrency.py` | Concurrent final-unit purchase | 2 |
| `tests/integration/test_delivery_management.py` | Admin delivery lifecycle management & RBAC | 3 |

## Frontend test breakdown

| File | Suite | Count |
| --- | --- | --- |
| `LandingPage.test.tsx` | Landing page render & CTAs | 1 |
| `LoginPage.test.tsx` | Login form submit → session & reviewer autofill | 2 |
| `RegisterPage.test.tsx` | Registration form submit & redirect | 1 |
| `ShowroomPage.test.tsx` | Authenticated vehicle catalogue, sign out, filter chips & side-by-side comparison | 4 |
| `VehicleDetailPage.test.tsx` | Detail page, purchase flow, financing & EMI estimator | 2 |
| `PurchaseHistoryPage.test.tsx` | Customer purchase history, printable receipt & concierge delivery tracker | 3 |
| `AdminInventoryPage.test.tsx` | Admin restock, inventory list, activity & transaction ledger audit log, concierge delivery lifecycle | 3 |
| **Total Automated Tests** | **Backend (24) + Frontend (16)** | **40 / 40 Passing (100%)** |

## Known notes

- The backend test client emits a FastAPI/Starlette `TestClient` deprecation warning. Behaviour is correct; migrate to `httpx.AsyncClient` + `ASGITransport` during a later test-harness refactor.
