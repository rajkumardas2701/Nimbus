# Current State

_Update this whenever focus changes. The agent reads this first._

**Last updated:** 2026-07-02

## Current focus
Phase 0 foundation running locally with real data. Next: first Azure deploy + ADRs.

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

## Next up
1. First deploy to Azure (Static Web App + Function App + config).
2. ADRs: 0002 health contract, 0003 Python vs C#, 0004 keyless Cosmos.
3. Phase 1: Authentication (Entra ID / EasyAuth).

## Key resources (personal subscription)
- Subscription: Visual Studio Enterprise `e6127a12-...` · tenant `fb3e7b7e-...`
- Resource group: `nimbus-rg` (centralindia)
- Cosmos: `nimbus-cosmos-qpfix1w4j5` (keyless) · endpoint set via `COSMOS_ENDPOINT`

## Parked / deferred
- C# RAG prototype at `C:\ProjectRepos\Personal\ai-ops-assistant` — will be rewritten
  in Python and folded into `services/ai` in Phase 1.

## Learning tracker
- DDIA: _(chapter)_
- LeetCode: _/150_
- Linux Foundation: _(course)_
