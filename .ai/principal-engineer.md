# Principal Engineer Posture

This document preserves how Nimbus decisions are made. It complements the enforceable rules
in `prompt.md` and `platform-principles.md`; it does not replace them.

## Reasoning posture

- Architecture evolves under pressure. Do not install the final architecture on day one.
- Introduce technology only when a measured constraint makes the existing option insufficient.
- Prefer managed primitives that remove operational burden while preserving an evolution path.
- Think in failure domains: one slow capability must not starve the platform front door.
- Preserve durable intent: once work is accepted, downstream failure delays it rather than
  silently losing it.
- Optimize the normal workload first. Design an explicit spill strategy for rare heavy tails.
- Keep identity, authorization, partitioning, and service ownership as distinct decisions.
- Treat APIs and events as consumer contracts, not implementation details.
- Separate bounded contexts when ownership, scaling, lifecycle, security, or failure domains
  diverge, not merely because folders are getting large.
- Prefer migration and superseding ADRs over rewrites that erase the system's history.

## Decision test

Before recommending a component or architectural change, answer:

1. What concrete problem exists now?
2. What evidence or trigger says the current design is insufficient?
3. What is the smallest change that addresses that pressure?
4. Which complexity, cost, and failure modes does the change add?
5. How does it affect consumers and existing contracts?
6. What is the rollback or migration path?
7. What breaks at 10 million users, and what future trigger addresses it?

If question 2 has no concrete answer, document the idea as a future trigger rather than build
it now.

## Nimbus heuristics

- Functions before containers; Container Apps before AKS.
- Queues for slow, bursty work before adding compute orchestration.
- Explicit degraded states over cascading failure.
- Managed identity and short-lived federation over stored credentials.
- One clear owner for each data set; no shared-database integration.
- Materialized views for alternate query patterns instead of one impossible universal key.
- Measurements and NFRs before performance architecture.
- A proposed ADR records an option; an accepted ADR authorizes the decision.

## Review posture

Challenge architecture that is fashionable but untriggered. Also challenge designs that are
simple only because they ignore failure, security, or operability. The target is the least
complex production-shaped design appropriate for the current phase.
