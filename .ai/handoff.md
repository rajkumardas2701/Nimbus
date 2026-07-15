# Nimbus Handoff

> Volatile shift-handover state. Update this file when the active task, blocker, branch, or
> immediate next step changes. Durable platform status belongs in `current-state.md`.

**Updated:** 2026-07-15

## Repository state

- Branch: `main`
- Base commit: `0d07603` — `docs(adr-0010): note Functions traceparent correlation as a known refinement`
- Working tree: documentation updates for recovered project context and the Phase 1 resume plan

## Current goal

Start the Phase 1 asynchronous AI Assistant MVP from ADR-0006.

Observability hardening completed before the worker slice:

- Live portal/API ingestion and explicit correlation verified.
- Five correlation/decorator unit tests added and passing.
- KQL diagnostics and an operations runbook added.
- API availability test and availability/failed-request alerts deployed.
- Queue trace-context contract added to the AI resume plan.

The first implementation slice is Week 1 Day 1-2 in
[`docs/phase1-ai-assistant-resume-plan.md`](../docs/phase1-ai-assistant-resume-plan.md):

1. Define AI request lifecycle contracts and status models.
2. Define repository and queue publisher boundaries.
3. Add the submit endpoint returning `202` + request id.
4. Add focused model/service/handler tests.

## Current risks

- **Identity propagation is not yet defined for the AI API.** EasyAuth identity currently
  terminates at the portal BFF while `services/api` is anonymous behind it. Before request
  ownership checks are coded, define the trusted portal-to-API identity contract. Do not trust
  arbitrary user/tenant headers from a public caller.
- **At-least-once queue delivery can duplicate work.** Persist and update by request id so
  worker retries are idempotent.
- **Azure OpenAI throttling can grow the backlog.** Keep the accepted request durable and
  expose an honest queued state; add bounded retries rather than unbounded retry loops.
- **Cosmos dependency spans are absent.** Live queries found no Cosmos dependencies over seven
  days. Add Azure SDK OpenTelemetry tracing without duplicating Function request telemetry.
- **Alerts do not notify anyone yet.** Both rules are enabled, but no Nimbus Action Group exists.

## Blocked on

Nothing blocks contract and domain-model work. Azure resource creation is deferred until the
local contracts and tests establish the required Service Bus and Cosmos shape.

## Open questions

1. What exact trusted identity envelope does the portal BFF send to the API?
2. Should the first queue use Service Bus sessions immediately for per-conversation ordering,
   or should the MVP permit one in-flight request per conversation and add sessions with the
   second-message workflow?
3. Which minimal behavior from the parked C# RAG prototype should be carried forward first?
4. Where should the Cosmos AI response container live, and what is the Phase 1 partition key?

## Immediate next action

Read ADR-0006 and the parked C# prototype boundaries, then implement only the AI request
contracts and their unit tests in `services/ai` or the owning Phase 1 Function service. Keep
the first change independent of live Azure resources. Implement W3C queue propagation in the
same change that adds the Service Bus publisher/worker, following the contract in the resume plan.

## Required references

- [`project-context.md`](./project-context.md)
- [`current-state.md`](./current-state.md)
- [`docs/adr/0006-async-ai-requests.md`](../docs/adr/0006-async-ai-requests.md)
- [`docs/nfr.md`](../docs/nfr.md)
- [`docs/scaling.md`](../docs/scaling.md)
- [`docs/phase1-ai-assistant-resume-plan.md`](../docs/phase1-ai-assistant-resume-plan.md)
