# syntax=docker/dockerfile:1
# ── Backend production image ─────────────────────────────────────────────────
FROM python:3.13-slim AS base

WORKDIR /app

# System dependencies (psycopg C extension)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy configuration, readme, migrations, and source
COPY pyproject.toml README.md alembic.ini ./
COPY alembic/ ./alembic/
COPY src/ ./src/

# Install application and dependencies via PEP 517 build
RUN pip install --no-cache-dir .

# ── Runtime ───────────────────────────────────────────────────────────────────
FROM base AS runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000

# Run Alembic upgrades then start Uvicorn
CMD ["sh", "-c", "alembic upgrade head && uvicorn aretiva.main:app --host 0.0.0.0 --port 8000"]
