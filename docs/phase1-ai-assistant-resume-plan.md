# Phase 1 Resume Plan (2026-07-14)

## Why this plan exists

You already finished CI/CD, identity foundation, and observability. The next highest-leverage move is the AI Assistant async path from ADR-0006, implemented without prematurely introducing containers or AKS.

This plan is designed so a coding agent can execute in small, safe increments and keep Nimbus production-shaped.

## Current baseline

Completed:

- Developer Portal with platform pages, account, and journal.
- Python Functions API with health + journal CRUD over Cosmos.
- OIDC keyless deploy workflow and smoke tests.
- EasyAuth identity model + authorization policy layer.
- App Insights + OpenTelemetry + correlation IDs.

Not completed:

- AI Assistant request pipeline (enqueue, worker, response retrieval).
- AI page real interaction loop (submit, pending, ready, failure).
- AI-specific telemetry and failure-mode tests.

## Scope for next 1-2 weeks

In scope:

1. Async AI request lifecycle (submit -> queued -> processing -> completed/failed).
2. Service Bus queue integration for load leveling.
3. Response store in Cosmos for polling retrieval.
4. Portal AI page wired to backend status flow.
5. Tests + smoke checks for the new flow.

Out of scope (stay phase-disciplined):

1. Container Apps / AKS.
2. Multi-region architecture.
3. Platform Bus fan-out (ADR-0008 remains proposed).
4. Large document ingestion pipeline.

## Proposed implementation shape

Keep the API and worker on Azure Functions (Python v2) for now.

Flow:

1. Portal sends AI command to API endpoint.
2. API validates input, writes command metadata, enqueues message, returns 202 with request id.
3. Worker function consumes queue message and calls AI provider.
4. Worker writes status/result to Cosmos response store.
5. Portal polls status endpoint until completed/failed/timeout.

## Week 1 plan

### Day 1: contracts and data model

Tasks:

1. Define request and response schemas for AI command lifecycle.
2. Add status model enum: queued, processing, completed, failed.
3. Create Cosmos repository contracts for AI requests and AI responses.
4. Add idempotency key handling contract for command submission.

Acceptance:

- Pydantic models merged and unit tested.
- API contract doc updated with AI endpoints and status payloads.

### Day 2: API submit endpoint

Tasks:

1. Add POST endpoint for creating AI requests (returns 202 + request id).
2. Validate user context and request payload boundary.
3. Persist initial record as queued.
4. Publish queue message with correlation id and tenant/user context.
5. Inject W3C `traceparent` and optional `tracestate` into Service Bus application properties;
	keep `correlationId` as a separate diagnostic field.

Acceptance:

- Endpoint returns deterministic 202 payload.
- Invalid input returns structured 400 with details.
- Unit tests cover happy path + validation failure.
- Queue publisher tests prove trace context and correlation id are preserved without putting
	prompts, identity claims, or tokens into telemetry properties.

### Day 3: status endpoint and retrieval

Tasks:

1. Add GET endpoint for AI request status by request id.
2. Return current state and response payload when ready.
3. Enforce authorization check for request ownership.
4. Add not-found and forbidden paths.

Acceptance:

- Polling endpoint works for queued/processing/completed/failed.
- Integration tests cover ownership boundary.

### Day 4: worker function

Tasks:

1. Add Service Bus trigger function for AI work items.
2. Mark request state to processing before model call.
3. Invoke AI provider abstraction and write result.
4. On failure, persist failed state with safe error reason.
5. Extract `traceparent` / `tracestate` from the message and start the worker span as a consumer
	child of the producer context. Link rather than parent only if processing becomes detached or
	batched.

Acceptance:

- Worker updates states correctly across success/failure.
- Retries are idempotent for duplicate queue delivery.
- Worker logs and spans retain the original correlation id and W3C trace across retry delivery.

### Day 5: observability + resilience

Tasks:

1. Add structured logs for enqueue, dequeue, model latency, completion.
2. Propagate correlation id end-to-end.
3. Apply timeout/retry/circuit-breaker behavior around model call.
4. Add fallback response strategy aligned to graceful degradation.
5. Verify one trace timeline covers API acceptance, Service Bus send/receive, model call, and
	Cosmos result write; record queue delay separately from model latency.

Acceptance:

- AI request traceability works via correlation id in logs.
- Failure paths return platform-safe degraded behavior.
- No prompt text, model response, tokens, identity claims, or document content is recorded in
	span attributes or queue diagnostic properties.

### Queue trace-context contract

The AI worker implementation must use these Service Bus application properties:

| Property | Purpose |
|----------|---------|
| `traceparent` | W3C producer context injected by the API |
| `tracestate` | Optional vendor-neutral W3C state |
| `correlationId` | Human-searchable Nimbus diagnostic ID |
| `requestId` | Durable/idempotent AI request identity |

Rules:

1. Use OpenTelemetry propagators to inject/extract context; do not manually construct trace IDs.
2. A retry keeps the same `requestId` and correlation ID; the processing attempt receives its
	 own span.
3. Record safe dimensions only: status, attempt, queue delay, model deployment name, token counts,
	 and duration. Never record prompt/response bodies or credentials.
4. Tests must cover context present, context absent/malformed, and duplicate delivery.

## Week 2 plan

### Day 6: portal AI page wiring

Tasks:

1. Replace coming-soon behavior on AI page with submit + poll loop.
2. Render explicit UI states: idle, queued, processing, completed, failed.
3. Show correlation id in debug metadata panel for diagnosis.
4. Preserve anonymous/authorized user experience rules.

Acceptance:

- User can submit a prompt and see state transitions.
- UI never hangs when backend is delayed.

### Day 7: testing hardening

Tasks:

1. Add backend unit tests for services/repositories.
2. Add integration tests for AI endpoints.
3. Add frontend tests for state transitions and error rendering.
4. Add at least one timeout + retry scenario.

Acceptance:

- New test suite passes locally and in CI.
- Failure-mode coverage exists for each AI endpoint.

### Day 8: deployment and smoke

Tasks:

1. Add required app settings for queue and AI provider.
2. Extend deployment smoke test to include AI endpoint health check.
3. Validate staged rollout in personal subscription.
4. Confirm no secret values are committed.

Acceptance:

- Deployment runs with keyless identity paths.
- Post-deploy smoke validates AI async submit/status flow.

### Day 9-10: cleanup and decision checkpoint

Tasks:

1. Resolve TODOs and tighten naming/docs.
2. Write ADR only if architecture materially changed.
3. Update current-state with what shipped and what remains.
4. Re-evaluate open DDIA Q2-Q5 based on implementation learnings.

Acceptance:

- Repo documents reflect true status.
- Next phase backlog is prioritized and measurable.

## Deliverables checklist

1. AI async API endpoints merged and tested.
2. Service Bus-triggered worker merged and tested.
3. Portal AI page connected to real async flow.
4. CI smoke updated for AI path.
5. current-state and roadmap progress updated.

## Risks and mitigations

1. Risk: queue backlog growth during model throttling.
Mitigation: enforce timeout, retry budget, and visible queued status.

2. Risk: duplicate processing from at-least-once delivery.
Mitigation: idempotent writes keyed by request id.

3. Risk: authorization leaks across users/tenants.
Mitigation: ownership checks in status retrieval and strict policy enforcement.

4. Risk: debugging complexity across async boundaries.
Mitigation: mandatory correlation id propagation and structured event logs.

## Suggested kickoff prompt for coding agent

Read AGENTS.md, .ai/current-state.md, docs/adr/0006-async-ai-requests.md, and this plan. Implement only Week 1 Day 1 and Day 2 with tests. Do not add containers, AKS, or non-managed infrastructure.
