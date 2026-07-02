# Platform Principles

These are non-negotiable. They exist to stop us from over-building.

1. **Evolve, never rewrite.** Each phase builds on the last. Deleting and restarting
   is a failure of design.
2. **Managed-first.** Prefer Azure managed services over self-hosted infrastructure
   until a concrete limit forces a change.
3. **Justify complexity.** Kubernetes, microservices, service mesh, event sourcing —
   none are introduced until traffic, cost, or reliability *demands* it. Write down the
   trigger that justified it.
4. **Every service is production-shaped.** From day one a service has: a `/health`
   endpoint, structured logs, and a clear public contract. Metrics, CI/CD, and a
   Dockerfile follow as the phase requires.
5. **One platform, many apps.** Apps live in `apps/`, capabilities live in `services/`.
   Shared code lives in `packages/`. Nothing is a silo.
6. **Document the "why".** Every significant decision becomes an ADR under `docs/adr/`.
7. **Scale is a story, not a number.** Every component records how it changes at
   10 → 100 → 10k → 100k → 1M → 10M users.
8. **Degrade gracefully.** When a dependency is overloaded or down, the user experience
   degrades ("assistant busy") — it never fails completely. Isolate failure domains so one
   capability can't take the platform down.

## Anti-goals

- No premature Kubernetes.
- No microservices for their own sake.
- No unmanaged infrastructure we have to babysit.
- No technology added without a written tradeoff.
