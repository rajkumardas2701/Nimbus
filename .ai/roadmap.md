# Roadmap

Legend: ✅ done · 🟡 in progress · ⬜ not started

## Phase 0 — 10 users (Foundation)
- ✅ Developer Portal (apps/portal) — the Azure Portal for Nimbus
- ✅ Platform API (services/api) — Python Function with `/health`
- ✅ Portal → API health wiring (`/platform` status page)
- ✅ Cosmos DB wiring — Learning Journal persists (serverless, keyless/AAD)
- ✅ Deploy portal + api to Azure — App Service (portal) + Function App (api)

## Phase 1 — 100 users
- ✅ CI/CD — GitHub Actions, keyless OIDC, path-filtered deploy + smoke test (ADR-0007)
- ✅ Authentication — identity platform: EasyAuth (Entra ID, allow-anonymous) + policy layer (ADR-0009)
- ⬜ Observability — structured logs, traces, metrics, correlation IDs (before AI, so AI is debuggable)
- ⬜ AI Assistant (RAG) — async on Functions (ADR-0006), rewritten in Python

## Phase 2 — 10,000 users
- ⬜ Search (Azure AI Search)
- ⬜ Notifications service
- ⬜ Documentation app
- ⬜ Platform Bus (event backbone) — domain events; services subscribe (telemetry, notifications, audit, search) [ADR-0008, proposed]

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
