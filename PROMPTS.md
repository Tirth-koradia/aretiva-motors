# AI Assistance Record

This file is the chronological index for the raw, unedited AI conversations used while building Aretiva Motors. It intentionally documents where AI helped, what was accepted or changed, and how the result was verified.

> Security note: passwords, API keys, access tokens, private customer data, and deployment secrets must never be pasted here or into any linked conversation.

## Session 1 — requirements, product decisions, and visual direction

- Date: 23–24 October 2026
- Tool: OpenAI Codex
- Topics: assessment interpretation, stack selection, TDD workflow, Aretiva naming, Verdigris Gallery visual system, feature boundaries, and repository architecture
- Raw transcript: **TODO before submission — add the public, unedited conversation link/export**
- Human decisions: selected React/TypeScript, FastAPI, PostgreSQL, Docker, public customer registration, seeded admin access, atomic single-unit purchases, transaction history, server-side filtering and pagination, and the Verdigris Gallery direction

Further implementation sessions will be appended without rewriting or sanitising their technical content. If a conversation ever contains a secret, it will not be published; the secret will be rotated and the omission will be disclosed here.

## Session 2 — CI, Docker containerization, production deployment, and multi-cloud readiness

- Date: 24 October 2026
- Tool: Antigravity / OpenAI Codex
- Topics: GitHub Actions CI runner fixes (Python 3.13, PostgreSQL port mapping, Alembic env configuration), Docker multi-stage build fixes, SPA routing rewrite for Vercel, dynamic port and scheme normalization for Render deployment, Render blueprint (`render.yaml`).
- Human decisions: Selected Vercel for React frontend edge hosting and Render for FastAPI backend and managed PostgreSQL; added automated startup administrator bootstrap.

