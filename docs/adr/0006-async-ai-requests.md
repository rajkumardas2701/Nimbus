# ADR 0006 — AI requests are asynchronous

- **Status:** Accepted
- **Date:** 2026-07-02

## Context

The AI Assistant (Phase 1) will be the chattiest capability on Nimbus — users hold
continuous conversations, generating far more traffic than the portal. AI calls are also
slow and bursty: LLM latency is seconds, and Azure OpenAI can throttle under load. The
portal, by contrast, must feel instant.

## Problem

A synchronous path — `Portal → API → AI → OpenAI` — couples a fast, user-facing workload to
a slow, bursty one. Under load the AI path contends for capacity and **starves the portal**;
OpenAI throttling propagates straight to the end user. The portal and AI share a **failure
domain**, which they must not.

## Decision

Make AI requests **asynchronous**, and keep everything on **Azure Functions** — no
containers yet, because Functions already scale independently and to zero:

```
Portal → API → Command Queue (Service Bus) → AI Worker (Function) → Response Store (Cosmos)
                                                                       → SignalR (later, push/stream)
```

- The API **validates and enqueues** a command, then returns immediately (`202` + request id).
- An **AI Worker** Function consumes the queue at its own pace — *queue-based load leveling*.
- The worker writes results to a **Response Store**; the portal **polls** now and will
  **stream via SignalR** later.
- Between the API and any synchronous dependency we apply a **resilience policy**:
  `timeout → retry → circuit breaker → fallback ("assistant busy")`.

## Alternatives considered

- **Synchronous request/response** — simplest, but couples failure domains; an AI or OpenAI
  slowdown degrades the entire portal. Rejected.
- **Move the AI service to Container Apps now** — premature (see ADR-0003). Functions already
  scale independently; containers are justified later by startup time, custom runtime,
  long-running workers, or multiple APIs (a Phase-3 trigger), not today.

## Consequences

- An AI traffic spike becomes a **backlog** (survivable) instead of **contention** (not).
- The portal **degrades gracefully** ("assistant busy") instead of hanging — now a platform
  principle.
- Added moving parts: a queue, a worker, a response store, and eventual consistency in the
  UX (poll now → push via SignalR later).
- Establishes NFRs for the AI path (see [nfr.md](../nfr.md)): portal < 2s, AI < 20s, portal
  stays available even when AI is down.

## Open distributed-systems question (DDIA)

With N workers draining one queue, how do we preserve **per-conversation ordering**
(Chat A: msg1 → msg2 → msg3)? This is a distributed-systems problem, not an Azure one.
Leading candidate: **Service Bus sessions** — one session per conversation pins its ordered
messages to a single worker at a time. Tracked as `scaling.md` Q2.
