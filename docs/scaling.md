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
| **100** | Real users, need identity | **Authentication** (Entra ID / EasyAuth); **CI/CD** so deploys are boring | Boundaries, safe change |
| **1,000** | AI assistant chatty; repeat questions; OpenAI cost | **Redis** cache (semantic + response); per-user rate limiting; token budgeting | Caching, read scaling |
| **10,000** | Multiple workloads competing; portal must stay fast | **Container Apps**: split portal / API / AI into independently scaling services; async where possible | Partitioning of *workloads*; back-pressure |
| **100,000** | Bursts, global users, RU pressure | Front Door + CDN; Cosmos **repartition** by tenant; provisioned throughput / autoscale; queue-based load leveling | Partitioning, derived data, load leveling |
| **1,000,000** | Regional latency + availability | Multi-region reads; AI gateway (APIM) for quota/caching/fallback models | Replication, leader/follower |
| **10,000,000** | Regional failure = outage | Active-active multi-region; Cosmos multi-write; **AKS only if a concrete limit forces it** | Consensus, multi-leader, conflict resolution |

---

## Standing design rules

- **API is the only path to data.** Portal, AI, dashboards, mobile — all consume the API,
  never the database directly.
- **Managed-first.** Prefer Azure managed services until a concrete limit forces a change
  (ADR-0004, ADR-0003).
- **No premature Kubernetes.** AKS appears only with a written trigger.
- **Isolate workloads before they interfere.** A slow/overloaded AI service must never take
  the portal down (see the open design challenge below).

---

## Open design questions (Principal Engineer challenges)

### Q1 — Isolate the AI workload (active)
When the AI Assistant goes live it may generate ~10× the portal's traffic (continuous
chat). **Without introducing Kubernetes**, redesign so the portal stays responsive even if
the AI service is overloaded. Levers: separate workloads, independent scaling, request
isolation, async patterns, Azure-native services. _Proposal in progress._

---

_Last updated: 2026-07-02 · Phase 0 complete._
