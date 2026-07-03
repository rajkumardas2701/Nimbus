# ADR 0001 — Adopt a monorepo, evolve don't rewrite

- **Status:** Accepted
- **Date:** 2026-07-02

## Context

Nimbus is a single platform hosting many apps and capabilities. We need a repository
structure that keeps apps, platform services, shared code, and infrastructure together,
and that supports gradual evolution from 10 to 10M users without rewrites.

## Decision

Use a **monorepo** with clear boundaries: `apps/` (user-facing), `services/` (platform
capabilities, Python Azure Functions), `packages/` (shared libraries), and
`infrastructure/`. Language policy: TypeScript in `apps/`/`packages/`, Python in
`services/`.

## Alternatives considered

- **Polyrepo (one repo per service)** — better isolation, but heavy overhead for a solo
  builder and makes cross-cutting evolution painful.
- **Single app, no structure** — fastest now, but collapses the moment a second
  capability appears.

## Consequences

- Easy cross-service refactors and shared code.
- One CI pipeline to reason about early; we add path-filtered workflows as services grow.
- We must be disciplined about boundaries so the monorepo doesn't become a mud ball.

## Triggers to revisit

- A service needs an independent release cadence, owner, or a compliance boundary.
- CI/build times balloon as services multiply (path-filtering no longer enough).
- A capability is spun out to a separate team or product — polyrepo for that piece.
