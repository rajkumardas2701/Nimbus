# ☁️ Nimbus

> A miniature cloud platform — built the way real internal platforms grow, from
> **10 users to 10 million**. Every app is a tenant *on* the platform.

Nimbus is not a collection of demos. It's one evolving platform that demonstrates
Azure, AI, distributed systems, platform engineering, Kubernetes, observability,
CI/CD, and event-driven architecture — introduced **only when the scale justifies it**.

## Why this exists

Most portfolios show a dozen disconnected apps. Nimbus shows **judgment**: a system
that starts simple and evolves under real constraints, with every decision documented.

## The platform brain

All vision, principles, and current state live in [`.ai/`](./.ai/). Start there —
especially [`.ai/current-state.md`](./.ai/current-state.md) and
[`.ai/roadmap.md`](./.ai/roadmap.md).

## Structure

```
Nimbus/
├── .ai/              # platform brain: vision, architecture, roadmap, state
├── .github/          # agent instructions + CI workflows
├── apps/             # user-facing apps
│   ├── portal/       # the Developer Portal (Phase 0 focus)
│   ├── docs/         # documentation site (later)
│   └── playground/   # API playground (later)
├── services/         # platform capabilities (Python Azure Functions)
│   ├── api/          # core platform API
│   ├── auth/         # authentication (later)
│   ├── ai/           # AI assistant / RAG (later)
│   ├── notifications/# notifications (later)
│   └── telemetry/    # telemetry (later)
├── packages/         # shared libraries
├── infrastructure/   # bicep · docker · github-actions · kubernetes
└── docs/             # docs + ADRs (docs/adr/)
```

## Tech stack (Phase 0)

- **Frontend:** Next.js (App Router) + TypeScript + Tailwind
- **Backend:** Azure Functions (**Python**, v2 model)
- **Data:** Cosmos DB (serverless)
- **Observability:** Application Insights

Full rationale in [`.ai/tech-stack.md`](./.ai/tech-stack.md).

## Roadmap

| Phase | Users | Theme |
|-------|-------|-------|
| 0 | 10 | Portal + API + Cosmos |
| 1 | 100 | Auth + AI Assistant |
| 2 | 10k | Telemetry, Notifications, Search, Docs |
| 3 | 100k | Containers, CI/CD, ACR, Container Apps |
| 4 | millions | AKS, GitOps, Observability, Service Mesh |

Details in [`.ai/roadmap.md`](./.ai/roadmap.md).

## Getting started

```bash
# Developer Portal
cd apps/portal && npm install && npm run dev

# Platform API
cd services/api && func start
```
