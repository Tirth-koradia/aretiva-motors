# Continuation guide

This document is intentionally maintained during development so another engineering agent can continue Aretiva Motors without reconstructing the project context.

## Current state

- Repository: `/Users/koradiatirth/Desktop/incubyte`
- Git branch: `main`
- No GitHub remote has been configured or pushed. Local commits use `Tirth0245 <tirthkoradia4@gmail.com>` and the required OpenAI Codex co-author trailer.
- Brand: **Aretiva Motors** - “excellence through iteration.” Tagline: **Engineered through every iteration.**
- Visual direction: **Verdigris Gallery** - canvas `#F6F2E9`, verdigris `#1F665E`, copper `#B8613B`, mist `#DDE9E3`, ink `#19312D`.

## Completed vertical slices

1. Root foundation: `.env.example`, `compose.yaml`, documentation, AI-log placeholder, editor settings, Git ignore rules.
2. Backend health contract: `GET /health` -> `{ "status": "ok", "service": "aretiva-api" }`.
3. Customer registration:
   - `POST /api/auth/register`
   - public schema has no role field; it always creates a `customer`
   - PostgreSQL persistence, Argon2id hash, case-normalized email, duplicate email -> controlled `409`.
4. Credential login:
   - `POST /api/auth/login`
   - case-normalized email; Argon2 verification; generic invalid credentials `401`
   - signed HS256 JWT with `sub`, `role`, `iss`, `aud`, `iat`, `exp`, and `jti`
5. Frontend foundation and public Aretiva landing page:
   - React + TypeScript + Vite + Tailwind v4 + React Router + TanStack Query
   - responsive landing page is visually checked at mobile and desktop widths
   - Vitest/RTL, ESLint, Prettier, TypeScript, and Vite production build pass
6. Authentication and protected browser flows:
   - `/login` calls the FastAPI login route, persists a browser session, and enters the showroom
   - `/register` creates customer accounts only; administrator access is intentionally absent
   - test setup includes a deterministic browser-storage implementation for the current Node/JSDOM environment
7. Vehicle inventory and showroom APIs:
   - PostgreSQL `vehicles` migration with realistic, validated fields and soft deletion
   - admin-only create, full update, and soft delete
   - authenticated paginated list, controlled search, and active-vehicle detail route
   - `/api/vehicles/search` is declared before `/{vehicle_id}`
8. Authenticated showroom frontend:
   - bearer-authenticated catalogue cards with responsive Verdigris Gallery styling
   - loading, empty, unauthenticated, and controlled error states

## Important decisions

- Required assessment routes use the exact `/api/...` prefix, not `/api/v1/...`.
- Backend: FastAPI, SQLAlchemy async + Psycopg 3, Alembic, PostgreSQL, Pytest.
- Frontend: React/TypeScript, Tailwind, React Router, TanStack Query. Use native `fetch`; do not add Redux/Axios without need.
- All vehicle APIs will be authenticated. Customers browse/search/purchase; only admins create/update/delete/restock.
- Public registration must never accept or grant `admin`.
- Inventory will use Decimal/`NUMERIC`, never floating point. Stock updates must be transactional and never negative.
- Purchasing exactly one unit will be atomic: conditional `UPDATE ... WHERE quantity >= 1`, transaction record in the same transaction, test concurrent final-item purchases against real PostgreSQL.
- Zero-stock vehicles remain visible but cannot be purchased.
- Customer purchases and administrator restocks must create immutable inventory transactions.
- Use server-side filtering and pagination. Put showroom filters and page in the URL.
- Do not add real payments, carts, recommendations, or microservices until all assessment essentials are polished.

## Run locally

From repository root:

```bash
cp .env.example .env
docker compose up -d database
```

The database host port is **55432**, chosen to avoid an existing local PostgreSQL service on 5432.

Backend:

```bash
cd backend
source .venv/bin/activate
python -m pytest -q
ruff check .
ruff format --check .
```

The virtual environment was created at `backend/.venv`; install/reinstall dependencies with:

```bash
python -m pip install -e '.[dev]'
```

Frontend:

```bash
cd frontend
npm install
npm test
npm run typecheck
npm run lint
npm run build
```

## Current tests

- Backend: 16 passing integration tests against isolated `aretiva_test` PostgreSQL database.
- Frontend: 4 passing Vitest/RTL interaction tests (landing, login, registration, showroom).
- Current checks: Ruff format/lint, TypeScript, ESLint, frontend production build all pass.
- The backend test client currently prints a FastAPI/Starlette `TestClient` deprecation warning; behaviour is correct, but replace it with `httpx.AsyncClient` + `ASGITransport` as a later test-harness refactor.

## Git/TDD discipline

The assessment requires visible Red -> Green -> Refactor development. Preserve it:

1. Create an executable failing test and commit it: `test(scope): ... [red]`.
2. Implement only what makes it pass and commit it: `feat(scope): ... [green]`.
3. Refactor only after green and commit it separately if material.
4. Every AI-assisted commit requires two blank lines before:

```text
Co-authored-by: OpenAI Codex <AI@users.noreply.github.com>
```

Do not squash the history before submission. Do not place tokens, passwords, private URLs, or secrets in code, commit messages, `PROMPTS.md`, screenshots, or raw chat logs.

## Immediate next work

1. Add secure, idempotent administrator bootstrap command (environment-defined credentials, not public registration). Seed documented disposable demo accounts later.
2. Implement the transaction-ledger migration/model plus atomic one-unit purchase and administrator restock. Use a conditional PostgreSQL update and test concurrent purchases of the final unit.
3. Add purchase history and the customer-facing vehicle-detail/purchase flow; add the matching real frontend vehicle-detail route.
4. Add the administrator dashboard/table/form, backed by the existing server-enforced vehicle management endpoints.
5. Extend showroom filter controls to use the search API and URL query parameters; add pagination controls.
6. Add CI, Dockerfiles, screenshots, deploy (Vercel frontend + Render backend/PostgreSQL), then finalize README, raw `PROMPTS.md` evidence, and test report.

## Key files

- Backend app factory: `backend/src/aretiva/main.py`
- API routes: `backend/src/aretiva/api/`
- Auth service: `backend/src/aretiva/services/auth.py`
- Vehicle service: `backend/src/aretiva/services/vehicles.py`
- Security/JWT: `backend/src/aretiva/core/security.py`
- Settings: `backend/src/aretiva/core/config.py`
- Migrations: `backend/alembic/versions/`
- PostgreSQL fixtures: `backend/tests/conftest.py`
- Frontend router: `frontend/src/app/router.tsx`
- Brand tokens: `frontend/src/styles/index.css`
- Landing page: `frontend/src/features/marketing/pages/LandingPage.tsx`
- Auth pages/session: `frontend/src/features/auth/`
- Showroom page/API client: `frontend/src/features/showroom/`

## Assessment constraints to re-check before submission

- Public repository, clear setup for backend and frontend, screenshots, test report, root `PROMPTS.md`, exact README section title **My AI Usage**.
- Persistent database; JWT register/login; React + Tailwind SPA; server-enforced admin actions.
- Required endpoints: register/login, create/list/search/update/delete vehicles, purchase, restock.
- Frequent descriptive commits and no plagiarism.
- Be prepared to explain every decision and AI-assisted line in an interview.

