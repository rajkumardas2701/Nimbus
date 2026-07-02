# Scaling — the living evolution of Nimbus

> A single document that tracks how Nimbus grows from 10 to 10,000,000 users.
> **Every DDIA chapter and every architecture decision updates this file.**
> Nothing here is thrown away — each stage evolves from the one before it.

Every feature added to Nimbus must answer three questions:

1. **Why does this exist?**
2. **What problem does it solve?**
3. **What breaks at 10 million users?**

That third question is what makes Nimbus different from a demo.

---

## Current scale — ~10 users (Phase 0)

### Architecture
```
Engineer
   │
   ▼
apps/portal  (Next.js SSR · Azure App Service F1)
   │
   ▼
services/api  (Python Azure Functions · Consumption)
   │
   ├──▶ Cosmos DB (serverless, keyless via managed identity)
   └──▶ (Application Insights — Phase 2)
```

### Known bottlenecks / observations
| Observation | Cause | Mitigation now | Long-term plan |
|-------------|-------|----------------|----------------|
| Portal cold start | App Service **F1** has no always-on | Accept; low traffic | B1 → Container Apps (scale-to-zero + warm) |
| API cold start (first `/journal` fell back to offline) | Functions **Consumption** cold start > 3s | Raised portal fetch timeout to 8s | Premium (pre-warmed) → Container Apps |
| `list journal` is cross-partition | Partition key `/id` ⇒ scatter-gather (see ADR-0005) | Fine at tens of docs | Repartition by `tenantId` / time bucket |
| Single region | Simplicity at Phase 0 | Accept | Multi-region read, then active-active |

---

## The evolution path (with triggers)

Each row lists the **trigger** that justifies the added complexity. We do not build ahead
of the trigger.

| Scale | Trigger | What we add | DDIA / concept |
|-------|---------|-------------|----------------|
| **10** | — | Portal → API → Cosmos, keyless, single region | Reliability, maintainability |
| **100** | Synchronous AI calls couple the portal to a slow, bursty workload | **Async AI on Functions**: API → Service Bus → AI Worker → Response Store; **Auth** (Entra ID); **CI/CD**. *Still just Functions — they already scale independently.* | Queue-based load leveling; failure domains |
| **1,000** | Repeat prompts + reads raise cost and latency | **Redis** cache (semantic + response); per-user rate limiting; token budgeting | Caching, read scaling |
| **10,000** | Retrieval quality + query load | **Azure AI Search** (hybrid + vector); *still Functions* | Indexes, derived data |
| **100,000** | Startup time / custom runtime / long-running workers / multiple APIs | **Azure Container Apps** for specific services (the ADR-0003 trigger fires); Front Door + CDN; Cosmos **repartition** by tenant | Partitioning of *workloads*; back-pressure |
| **1,000,000** | Regional latency + availability | Multi-region reads; **AI gateway (APIM)** for quota / caching / fallback models | Replication, leader/follower |
| **10,000,000** | Orchestration / networking needs make k8s the *simplest* option | Active-active multi-region; Cosmos multi-write; **AKS only when it's genuinely simplest** | Consensus, multi-leader, conflict resolution |

---

## Standing design rules

- **API is the only path to data.** Portal, AI, dashboards, mobile — all consume the API,
  never the database directly.
- **Managed-first.** Prefer Azure managed services until a concrete limit forces a change
  (ADR-0004, ADR-0003).
- **No premature Kubernetes.** AKS appears only with a written trigger.
- **Isolate workloads before they interfere.** A slow/overloaded AI service must never take
  the portal down (see the open design challenge below).
- **Degrade gracefully.** A dependency being overloaded or down degrades the experience
  ("assistant busy") — it never fails the whole platform. Isolate failure domains.

---

## Open design questions (Principal Engineer challenges)

### Q1 — Isolate the AI workload (resolved → ADR-0006)
When the AI Assistant goes live it may generate ~10× the portal's traffic (continuous
chat). Decision: keep everything on **Azure Functions** (they already scale independently —
**no Container Apps yet**) and make AI **asynchronous**:

```
Portal → API → Command Queue (Service Bus) → AI Worker (Function) → Response Store (Cosmos)
                                                                     → SignalR (later)
```

The API enqueues and returns immediately; the worker drains the queue at its own pace
(load leveling); the portal polls now, streams via SignalR later. Between the API and any
synchronous dependency we apply a **resilience policy**:

```
timeout → retry → circuit breaker → fallback ("assistant busy")
```

### Q2 — Ordering with N workers (DDIA homework, open)
If 50 AI workers consume one queue, how do we guarantee that messages within a single
conversation (Chat A: msg1 → msg2 → msg3) are processed **in order**? This is a
distributed-systems problem, not an Azure one. Leading candidate: **Service Bus sessions**
— one session per conversation pins its ordered messages to a single worker at a time,
trading some per-conversation parallelism for ordering. Revisit with DDIA (Partitioning →
ordering guarantees, logs).

---

_Last updated: 2026-07-02 · Phase 0 complete._
