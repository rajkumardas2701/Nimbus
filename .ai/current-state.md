# Current State

_Update this whenever focus changes. The agent reads this first._

**Last updated:** 2026-07-02

## Current focus
Phase 1. Auth shipped (identity platform). Next: Observability (before AI).

## Phase
Phase 0 — 10 users. Foundation.

## What exists
- Monorepo skeleton + `.ai/` brain docs
- VS Code agent instructions wired (`.github/copilot-instructions.md`, `AGENTS.md`)
- **apps/portal** — Developer Portal built: sidebar nav + Overview, About, Projects,
  Architecture, Roadmap, Learning Journal, Platform Status, and Coming-Soon pages for
  AI Assistant / Telemetry / Notifications. Dark "Nimbus" design system (Tailwind v4).
- **services/api** — Python Functions (v2 model) with `GET /api/health` returning
  `{ status, service, version }`. Runs via `func start` on :7071 in a `.venv`.
- **Portal → API wired**: `/platform` server-side probes `/health` (env `NIMBUS_API_URL`,
  default `http://localhost:7071`) and renders live Healthy/Unreachable state.
- **Cosmos DB wired**: `services/api` has Learning Journal CRUD (handlers → services →
  repositories) over Cosmos `journal` container, keyless via DefaultAzureCredential.
  The portal `/journal` page reads live from Cosmos (local fallback when offline).
- Verified locally: all 10 portal routes 200; `/platform` Healthy; journal round-trips.

## Run locally
- API: `cd services/api; .\.venv\Scripts\Activate.ps1; func start --port 7071`
- Portal: `cd apps/portal; npm run dev` (http://localhost:3000)

## Next up (Principal Engineer review — reordered)
1. ✅ ADRs 0002–0007 (each with a "Triggers to revisit" section) + `scaling.md` + `nfr.md`; graceful-degradation principle
2. ✅ **CI/CD** — keyless OIDC, path-filtered deploy + smoke test (ADR-0007)
3. ✅ **Authentication** — identity platform: EasyAuth (Entra ID, allow-anonymous), `NimbusUser`, policy layer (`can(user, policy)`, one policy), `/account` page (ADR-0009)
4. **Observability** — logs, traces, metrics, correlation IDs (before AI, so AI is debuggable) ← next
5. Then **AI Assistant** — async on Functions (ADR-0006)
- Open DDIA questions (`docs/scaling.md`): Q2 ordering with N workers; Q3 conversations key (hierarchical `tenantId → conversationId`, + hot-conversation sharding); Q4 bounded contexts at 1M (service vs container vs collection); Q5 5 GB PDF ingestion (fairness, staged pipeline, resumability, idempotency, durable intent).

## Key resources (personal subscription)
- Subscription: Visual Studio Enterprise `e6127a12-...` · tenant `fb3e7b7e-...`
- Resource group: `nimbus-rg` (centralindia)
- Cosmos: `nimbus-cosmos-qpfix1w4j5` (keyless) · endpoint set via `COSMOS_ENDPOINT`
- **Live portal:** https://nimbus-portal.azurewebsites.net (App Service F1, `nimbus-plan`)
- **Live API:** https://nimbus-platform-api.azurewebsites.net (Function App, Consumption)
- Storage: `nimbusstoragz1s3h4` · Function App MI has Cosmos data-plane RBAC
- Portal deploy: `next build` (standalone) → zip → `az webapp deploy`; API: `func azure functionapp publish`

## Parked / deferred
- C# RAG prototype at `C:\ProjectRepos\Personal\ai-ops-assistant` — will be rewritten
  in Python and folded into `services/ai` in Phase 1.

## Learning tracker
- DDIA: _(chapter)_
- LeetCode: _/150_
- Linux Foundation: _(course)_
