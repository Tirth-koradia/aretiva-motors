# Architecture notes

## Product boundary

Aretiva Motors supports two roles:

- Customers can register, sign in, browse and filter vehicles, inspect details, purchase one available unit, and view their purchase history.
- Administrators can manage vehicle information, restock inventory, remove vehicles, and inspect inventory activity.

Public registration can only create customer accounts. Administrator access is seeded through environment configuration.

## System shape

The repository is a deliberately small modular monolith:

```text
React SPA  ──HTTP/JSON──>  FastAPI  ──SQL──>  PostgreSQL
```

This shape keeps deployment and review straightforward while preserving clear boundaries between HTTP routes, application services, persistence, and the interface.

## Inventory correctness

Purchasing is a database transaction, not a read-then-write operation. The backend will conditionally decrement stock only when `quantity > 0` and record the purchase in the same transaction. Concurrent requests for the final unit must result in exactly one successful purchase and stock must never become negative.

Inventory quantity is changed only by purchase and restock operations. General vehicle updates cannot silently rewrite stock, preserving an auditable activity trail.

## Frontend data flow

TanStack Query owns server state and caching. A small authentication context owns the current session. Search filters and pagination live in the URL so catalogue views are shareable and browser navigation behaves predictably.

