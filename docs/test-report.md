# Test report

This report will be updated after every completed vertical slice and finalized before submission.

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

Project foundation in progress; executable results will be recorded once the first Red–Green cycle is complete.

