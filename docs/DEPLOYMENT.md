# Aretiva Motors - Production Deployment Guide

This guide details how to deploy **Aretiva Motors** to production using **Render** for the backend and database, and **Vercel** for the frontend.

---

## Architecture Overview

```
                      ┌────────────────────────────┐
                      │    Vercel Edge Network     │
                      │  (React 19 + Vite + SPA)   │
                      │  https://<app>.vercel.app  │
                      └─────────────┬──────────────┘
                                    │ HTTPS (API requests)
                                    ▼
                      ┌────────────────────────────┐
                      │      Render Web Service    │
                      │  (FastAPI + Python 3.13)   │
                      │ https://<api>.onrender.com │
                      └─────────────┬──────────────┘
                                    │ psycopg (async)
                                    ▼
                      ┌────────────────────────────┐
                      │    Render PostgreSQL DB    │
                      │     (Free Managed DB)      │
                      └────────────────────────────┘
```

---

## Part 1: Deploy Backend & Database on Render

### Option A: 1-Click Blueprint (Recommended)

Because the repository includes `render.yaml`, Render can provision both the PostgreSQL database and the FastAPI web service automatically:

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** in the top navigation and select **Blueprint**.
3. Connect your GitHub account and select repository `Tirth-koradia/aretiva-motors`.
4. Render will detect `render.yaml` and show:
   - Database: `aretiva-db` (PostgreSQL)
   - Web Service: `aretiva-backend` (Python 3.13)
5. Review the plan (Free) and click **Apply**.
6. Render will:
   - Provision the PostgreSQL database.
   - Run `alembic upgrade head` to apply all database tables.
   - Start the FastAPI server on `$PORT`.
   - Automatically initialize the default administrator (`admin@aretiva.com`).
7. Once deployed, note down your backend URL (e.g., `https://aretiva-backend-xxxx.onrender.com`).

---

### Option B: Manual Setup on Render

If you prefer to configure the services manually:

#### Step 1: Create PostgreSQL Database
1. In Render Dashboard, click **New +** -> **PostgreSQL**.
2. Name: `aretiva-db`
3. Database: `aretiva`
4. User: `aretiva`
5. Plan: **Free**
6. Click **Create Database**.
7. Once created, copy the **Internal Database URL** (or External if connecting from outside Render).

#### Step 2: Create Web Service
1. Click **New +** -> **Web Service**.
2. Connect repository `Tirth-koradia/aretiva-motors`.
3. Configure the service:
   - **Name:** `aretiva-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -e .`
   - **Start Command:** `alembic upgrade head && uvicorn aretiva.main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** `Free`
4. Under **Environment Variables**, add:
   - `DATABASE_URL`: *(paste the PostgreSQL Connection String)*
   - `JWT_SECRET`: *(click Generate or enter a strong secret)*
   - `ADMIN_EMAIL`: `admin@aretiva.com`
   - `ADMIN_PASSWORD`: `ChangeMe123!`
   - `CORS_ORIGINS`: `*` (or your Vercel frontend URL once generated)
5. Click **Create Web Service**.
6. Wait for the build to succeed. You can verify it is live by visiting `https://<your-render-url>/health` in your browser (should return `{"status":"ok","service":"aretiva-api"}`).

---

## Part 2: Deploy Frontend on Vercel

1. Log in to [Vercel](https://vercel.com/) and go to the dashboard.
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `Tirth-koradia/aretiva-motors`.
4. Configure the project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and select `frontend`.
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
5. Under **Environment Variables**, add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://<your-render-backend-url>.onrender.com/api`
     *(Note: The `/api` suffix is handled automatically, but adding it explicitly is best practice)*
6. Click **Deploy**.
7. Vercel will build the frontend and provide your production URL (e.g., `https://aretiva-motors.vercel.app`).

---

## Part 3: Verify the Live Deployment

1. Open your Vercel URL in a browser.
2. **Visitor & Showroom:** Check that vehicles and categories load without error.
3. **Customer Registration & Purchase:**
   - Register a new customer account at `/register`.
   - Sign in and purchase a vehicle.
   - Verify stock decrements in real-time and appears in `/purchases`.
4. **Administrator Portal:**
   - Sign in with `admin@aretiva.com` and your configured password (`ChangeMe123!`).
   - Navigate to `/admin/inventory`.
   - Test "Add Vehicle", "Edit Vehicle", and "Restock".
