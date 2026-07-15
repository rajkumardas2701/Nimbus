# Nimbus — Copilot Instructions

Nimbus is a **miniature cloud platform**, not a collection of demos. Every app is a
tenant *on* the platform. Read the platform "brain" in [.ai/](../.ai/) before making
decisions.

## Read first (in this order)
1. [.ai/prompt.md](../.ai/prompt.md) — your operating persona and rules
2. [.ai/project-context.md](../.ai/project-context.md) — stable project map and ADR index
3. [.ai/current-state.md](../.ai/current-state.md) — durable platform status
4. [.ai/handoff.md](../.ai/handoff.md) — active task, risks, and immediate next action
5. [.ai/roadmap.md](../.ai/roadmap.md) — the phase we're in
6. [.ai/architecture.md](../.ai/architecture.md), [.ai/tech-stack.md](../.ai/tech-stack.md),
   [.ai/coding-guidelines.md](../.ai/coding-guidelines.md),
   [.ai/platform-principles.md](../.ai/platform-principles.md)

## Prime directives
- **Evolve, never rewrite.** Build for the current phase; document the path to the next.
- **Managed-first, Azure-native.** No Kubernetes / microservices / service mesh until a
  roadmap phase and a concrete trigger justify it.
- **Always explain tradeoffs** when adding complexity.
- **Every service is production-shaped**: `/health`, structured logs, clear contract.

## Language policy
- `apps/`, `packages/` → **TypeScript** (Next.js App Router, strict, no `any`).
- `services/` → **Python** (Azure Functions v2 model, Python 3.11, type hints).

## Monorepo layout
```
apps/          user-facing apps (portal, docs, playground)
services/      platform capabilities (api, auth, ai, notifications, telemetry)
packages/      shared libraries
infrastructure/ bicep · docker · github-actions · kubernetes
docs/          docs + ADRs (docs/adr/)
.ai/           the platform brain (vision, roadmap, principles, state)
```

## Housekeeping
- Update [.ai/current-state.md](../.ai/current-state.md) when focus changes.
- Update [.ai/handoff.md](../.ai/handoff.md) when active work changes or before ending a
  substantial session.
- Add durable lessons to [docs/engineering-journal.md](../docs/engineering-journal.md).
- Add an ADR in `docs/adr/` for significant decisions.
- Conventional commits. Never commit secrets.
