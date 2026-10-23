# syntax=docker/dockerfile:1
# ── Backend production image ─────────────────────────────────────────────────
FROM python:3.12-slim AS base

WORKDIR /app

# System dependencies (psycopg C extension)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies via PEP 517 build
COPY pyproject.toml ./
RUN pip install --no-cache-dir -e '.'

# Copy application source
COPY src/ ./src/

# ── Runtime ───────────────────────────────────────────────────────────────────
FROM base AS runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

EXPOSE 8000

# Run Alembic upgrades then start Uvicorn
CMD ["sh", "-c", "alembic upgrade head && uvicorn aretiva.main:app --host 0.0.0.0 --port 8000"]
