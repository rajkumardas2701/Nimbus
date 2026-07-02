# ADR 0003 — Host the portal on Azure App Service (for now)

- **Status:** Accepted
- **Date:** 2026-07-02

## Context

The Developer Portal is a Next.js app with server-rendered pages (`/platform`, `/journal`
use `force-dynamic` to read live data through the API). We needed a host that:

1. gives a **meaningful hostname** without owning a custom domain,
2. supports **SSR** (not just static export),
3. is **cheap** and low-ops at Phase 0 (10 users).

## Decision

Host the portal on **Azure App Service (Linux, Node 22), Free F1 tier**, deployed as a
Next.js **standalone** build. This yields `https://nimbus-portal.azurewebsites.net` — a
clean, self-chosen name — at $0.

## Alternatives considered

- **Azure Static Web Apps** — the "natural" managed host for Next.js and free. Rejected for
  now: the hostname is **auto-generated and random** (e.g. `jolly-mushroom-…`), and a
  meaningful name requires owning a custom domain, which we don't have yet. SSR support is
  also more constrained.
- **Azure Container Apps** — great fit later: scales to zero, independent scaling, clean
  revisions. Rejected for Phase 0 because it needs Docker + a registry (that's Phase 3
  work), and its hostname carries a random middle label
  (`app.<random>.<region>.azurecontainerapps.io`) — less clean than App Service.
- **AKS** — categorically over-engineered for 10 users; violates our "no premature
  Kubernetes" principle.

## Consequences

- Meaningful URL today, no domain purchase required.
- F1 has trade-offs: **cold starts**, a daily CPU quota, no always-on, no autoscale.
  Acceptable at Phase 0; tracked in [scaling.md](../scaling.md).
- **Revisit trigger:** when we containerize services (Phase 3), or when we need
  scale-to-zero + independent workload scaling (see the Principal Engineer challenge on
  isolating the AI workload), move the portal to **Container Apps**. This ADR will be
  superseded then, not rewritten away.

## What breaks at 10M users?

App Service on a single small plan cannot absorb portal + growing traffic. The evolution
path is App Service → Container Apps (independent scaling, scale-to-zero) → AKS (only if a
concrete platform limit forces it). Front Door + CDN front the static assets long before
that.
