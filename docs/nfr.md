# Non-functional requirements (NFRs)

> Functional requirements say **what** the system does. NFRs say **how well**. Every Nimbus
> capability records its NFRs so architecture is measured against targets, not vibes.
> When a decision is made, it must be justified against the numbers below.

## Platform-wide

| Attribute | Target | Notes |
|-----------|--------|-------|
| Availability | 99.9% for the portal | The portal is the front door; it stays up even when a capability is down |
| Latency | Portal < 2s p95 · API reads < 500ms p95 | User-facing paths stay snappy |
| Security | Entra ID auth (Phase 1+) · managed identity · **zero secrets** | ADR-0004 |
| Observability | Structured logs now → metrics + tracing (OpenTelemetry) as we go multi-service | |
| Scalability | 10 → 10M users, evolved per [scaling.md](./scaling.md) | No premature complexity |
| Cost | Prefer scale-to-zero / consumption until a trigger justifies reserved capacity | |

## AI Assistant (Phase 1)

| Attribute | Target | Notes |
|-----------|--------|-------|
| Availability | Portal stays up even if AI is down | **Graceful degradation** ("assistant busy") |
| Latency | Portal path < 2s · AI response < 20s | AI is async, never blocks the portal (ADR-0006) |
| Throughput | Absorb ~10× portal traffic | Queue-based load leveling |
| Ordering | Per-conversation message order preserved | See scaling.md Q2 (Service Bus sessions) |
| Cost control | Semantic cache + per-user rate limiting in front of Azure OpenAI | |
| Auth | Entra ID; per-user identity flows into the AI request | |

---

_Every new capability adds a row/table here before it ships._
