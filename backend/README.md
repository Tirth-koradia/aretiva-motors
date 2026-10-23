# Aretiva Motors API

FastAPI service for authentication, vehicle inventory, purchasing, and stock activity.

## Administrator bootstrap

After starting PostgreSQL, apply migrations and set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your local `.env`:

```bash
alembic upgrade head
```

Then run:

```bash
aretiva-admin --name "Aretiva Administrator"
```

The command is idempotent: it creates the administrator once and safely confirms or promotes the configured email on later runs. Public registration always creates a customer.

