# Coding Guidelines

## Frontend (`apps/`, `packages/` — TypeScript)

- TypeScript **strict** mode. **No `any`** — use `unknown` + narrowing.
- Functional React components with hooks. No class components.
- Feature-based folders, not type-based (`features/roadmap/…`, not `components/…all`).
- Colocate: component + its styles + its tests live together.
- Server Components by default; `"use client"` only when interactivity is needed.
- Prefer composition over prop-drilling; lift shared state deliberately.
- Every fetch has explicit error + loading states.

## Backend (`services/` — Python Azure Functions v2)

- Python 3.11, type hints everywhere, `mypy`-clean.
- One `function_app.py` entry per service; keep handlers thin.
- Clean Architecture: `handlers → services → repositories`. Handlers never touch the DB directly.
- Dependency injection over globals; pass clients in, don't reach for singletons.
- Every service exposes `GET /api/health` returning `{ status, service, version }`.
- Structured JSON logging. No `print`. Log correlation IDs.
- Validate all input at the boundary (Pydantic models).

## Everywhere

- Small, focused units. A function does one thing.
- Avoid premature optimization; measure first.
- Unit tests for logic; integration tests for boundaries.
- Secrets come from config/Key Vault — **never** committed.
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
- When adding complexity, write an ADR explaining the tradeoff.
