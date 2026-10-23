# Test report

This report is maintained during development and will be finalized with CI and browser evidence before submission.

## Planned layers

| Layer | Tooling | Purpose |
| --- | --- | --- |
| Backend unit/integration | Pytest | Domain rules, authentication, authorization, API contracts, and database behavior |
| Frontend component | Vitest + Testing Library | User-visible behavior, forms, accessibility, and failure states |
| Browser journeys | Playwright | Critical customer and administrator workflows |
| Static checks | Ruff + TypeScript + ESLint | Formatting, linting, and type safety |

## High-risk scenarios

- Public registration cannot grant administrator access.
- Customers cannot call administrator-only operations.
- Two simultaneous purchases of the final unit produce one success and one conflict.
- Failed purchases never decrement inventory or create history records.
- Vehicle quantity never becomes negative.

## Current result

| Check | Result | Evidence |
| --- | --- | --- |
| Backend integration suite | Pass | `16 passed` against isolated PostgreSQL (`aretiva_test`) |
| Backend static checks | Pass | Ruff format and lint clean |
| Frontend interaction suite | Pass | `4 passed` with Vitest + Testing Library |
| Frontend static checks | Pass | TypeScript and ESLint clean |
| Frontend production build | Pass | Vite production bundle built successfully |

The backend suite currently emits a FastAPI/Starlette `TestClient` deprecation warning. It does not affect observed behaviour; migrate to `httpx.AsyncClient` with `ASGITransport` during a later test-harness refactor.

