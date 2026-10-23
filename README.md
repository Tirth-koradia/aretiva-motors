# Aretiva Motors

> Engineered through every iteration.

Aretiva Motors is a full-stack vehicle inventory and purchasing experience built as an exercise in software craftsmanship. The name combines *aretē* (excellence) with iteration: quality earned through continuous refinement.

The application is being developed test-first with small Red–Green–Refactor cycles. It will include a customer showroom, detailed vehicle pages, safe purchasing, purchase history, and a role-protected administration workspace.

## Technology

- React, TypeScript, Vite, and Tailwind CSS
- FastAPI, SQLAlchemy, Alembic, and PostgreSQL
- Pytest, Vitest, Testing Library, and Playwright
- Docker Compose and GitHub Actions

## Repository structure

```text
aretiva-motors/
├── backend/          FastAPI application and tests
├── frontend/         React application and tests
├── docs/             Architecture notes and test report
├── compose.yaml      Local PostgreSQL service
├── PROMPTS.md       Unedited AI-assistance record
└── README.md
```

Setup, demo credentials, deployment links, screenshots, and the final test report will be added as each verified vertical slice is completed.

## My AI Usage

AI is being used as a collaborative engineering tool for requirement analysis, design exploration, implementation support, test review, and documentation. Every suggestion is reviewed, adapted, and verified with automated tests. The chronological assistance record is maintained in [`PROMPTS.md`](./PROMPTS.md); secrets and credentials are never included.

