# Roadmap

Legend: ✅ done · 🟡 in progress · ⬜ not started

## Phase 0 — 10 users (Foundation)
- ✅ Developer Portal (apps/portal) — the Azure Portal for Nimbus
- ✅ Platform API (services/api) — Python Function with `/health`
- ✅ Portal → API health wiring (`/platform` status page)
- ✅ Cosmos DB wiring — Learning Journal persists (serverless, keyless/AAD)
- ⬜ Deploy portal + api to Azure

## Phase 1 — 100 users
- ⬜ Authentication (Entra ID / EasyAuth)
- ⬜ AI Assistant (RAG) — fold in the parked prototype, rewritten in Python

## Phase 2 — 10,000 users
- ⬜ Telemetry service
- ⬜ Notifications service
- ⬜ Search (Azure AI Search)
- ⬜ Documentation app

## Phase 3 — 100,000 users
- ⬜ Dockerize services
- ⬜ GitHub Actions CI/CD
- ⬜ Azure Container Registry
- ⬜ Azure Container Apps

## Phase 4 — millions of users
- ⬜ AKS
- ⬜ GitOps (Flux/Argo)
- ⬜ Observability (OpenTelemetry)
- ⬜ Service Mesh

---

Each item, when built, gets an ADR in `docs/adr/` and a "scale journey" note.
