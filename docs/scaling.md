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
- **Authorization ≠ partitioning.** Authorization enforces *access*; partitioning optimizes
  *storage and query performance*. Identity → authorization → partitioning are related but
  evolve independently — never bend a partition key to satisfy a security rule.

## Data model — a key per workload (no universal partition key)

Each container picks the key that matches **its** workload. There is no universal key — that
realization is the point.

| Container | Partition key | Why |
|-----------|---------------|-----|
| AI Conversations | `tenantId` → `conversationId` (hierarchical) | Isolation + spreads a huge tenant; single-partition on the chat hot path |
| Learning Journal | `userId` | Owned + queried per user |
| Notifications | `userId` | Delivered + read per user |
| Telemetry | `service` + `day` (or `tenantId` + `day`) | Time-series; bounded partition size; recent-window reads |
| Audit | `tenantId` + `day` | Append-only, compliance retention, tenant-scoped |
| Embeddings | vector store / Search (not a chat container) | ANN search is a different workload entirely |

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

### Q3 — Partition key for AI Conversations at 10M users (PE Challenge #2)
Multi-tenant and highly skewed: Microsoft (300k users), Contoso (500), Fabrikam (40).
Candidates: `/userId`, `/tenantId`, `/conversationId`, or a hierarchical key.

- **`/tenantId`** — best tenant isolation, but a **hot partition**: Microsoft's 300k users
  all land in one logical partition and blow the 20 GB / 10k-RU cap. Skew makes it a dead end.
- **`/userId`** — spreads better; "my conversations" is single-partition. But a power user's
  history can still grow large, and cross-tenant admin queries fan out.
- **`/conversationId`** — **maximal distribution, no hot partition even for a huge tenant**,
  and the dominant hot path (append/read messages *within one conversation*) is
  **single-partition**. Weakness: "list all my conversations" fans out.

**Answer:** use a **hierarchical partition key `/tenantId` → `/conversationId`** (Cosmos
supports up to 3 levels). Tenant-level grouping gives isolation and efficient tenant-scoped
queries, while sub-partitioning by `conversationId` **spreads a giant tenant across many
physical partitions** (kills the hot partition) and keeps a conversation's messages
single-partition on the hot path. Serve the "list my conversations" sidebar from a small
**derived index keyed by `userId`** (materialized view — DDIA). Tenant isolation is enforced
by the authorization layer (every query carries tenant + RBAC), not by the key alone.

_If forced to pick one flat key: `/conversationId` — distribution + single-partition chat —
with a `userId` index for listing._

### Q3 refinements (design-review follow-ups)

- **Sequential conversation IDs re-create a hot partition.** A monotonic/time-based
  `conversationId` clusters all new writes into the newest key range (the auto-increment
  anti-pattern, DDIA Ch. 6). Fix: **random/hashed IDs** (GUIDs) so writes spread uniformly;
  keep time as a *sort* field, never the partition key.
- **One viral conversation moves the hot partition, doesn't remove it.** `conversationId`
  puts *all* of a conversation's messages in one logical partition — a 1M-message incident
  (`INC-2026-001`) blows 20 GB / 10k RU. Fix: **shard the hot conversation** with a synthetic
  suffix (`conversationId + bucket`, bucket = `hash(messageId) % N` or a time window); reading
  the whole thread then fans out across buckets — fine, because we page recent messages. No
  single key is optimal for both a tiny chat and a viral one: design for the common case, add
  a spill strategy for the tail.
- **Different facets are different bounded contexts.** Messages, embeddings, summaries, token
  usage, citations, reactions, and audit logs have different access patterns, lifecycles, and
  failure domains — they should not share one key or one container.

### Q4 — Service vs database vs collection at 1M users (PE Challenge #3)

Framed by **bounded context · ownership · scaling · failure domain** (not Azure SKUs):

| Data | Boundary | Why |
|------|----------|-----|
| Messages + conversation metadata + summaries | **Conversation service**, one container (`tenantId → conversationId`) | Same hot path, read together, one owner |
| Embeddings + search index | **Retrieval service**, separate vector store | ANN search is a different workload + failure domain; retrieval can degrade while chat lives |
| Uploaded documents | **Ingestion service**; blobs in Storage + a metadata container | Large binaries aren't Cosmos; separate scan/chunk pipeline |
| Token usage / metering | Separate container/pipeline (`tenantId + day`) | Append-only time-series for billing; own lifecycle |
| Audit events | Separate container (`tenantId + day`), restricted access | Compliance retention + isolation; must survive independently |

**Decision rules:** separate **service** when scaling / failure domain / ownership / deploy
cadence differ (Chat, Retrieval, Ingestion); separate **container/DB** when partition key,
retention, security, or throughput differ (embeddings, audit, metering); **same container,
different item type** only when access pattern + lifecycle + key match and they're read
together. Failure domains: retrieval down → chat still answers (ungrounded); ingestion down →
no new docs, chat works; audit must be durable and isolated.

> **Evolution note:** summaries start co-located in the conversation container, but as every
> AI response updates conversation + summary + title + suggested prompts, those writes pile
> onto one partition. When that contention shows up, summaries graduate to their own bounded
> context: `Conversation → Summary Worker → Summary container`. We evolve there; we don't
> start there.

### Q5 — 5 GB PDF ingestion at 5M users / 2,000 tenants (PE Challenge #4)

1. **Isolation / fairness.** Never process whole documents through one FIFO queue — a 5 GB doc
   head-of-line-blocks everyone. Make the **unit of work a chunk**, not a document, so a giant
   doc becomes many small items interleaved with others. Add **per-tenant fair scheduling**
   (Service Bus sessions or per-tenant/tier queues, round-robin) and **per-tenant concurrency
   caps** so no tenant monopolizes workers; route very large docs to a throttled **bulk lane**
   (bulkhead), keeping the small-doc lane fast.
2. **Stages, not one worker.** Chunking (CPU/parse), embedding (network + OpenAI-throttled),
   and indexing (search I/O) have different resource profiles, scaling needs, and failure
   modes. Separate them into **event-driven stages** so the throttled stage (embedding) scales
   independently and one failure doesn't force redoing the others.
3. **Resumable without duplication.** Checkpoint at the **chunk** level with **deterministic
   chunk ids** (`docId + chunkIndex` or content hash) and per-chunk state
   (pending/embedded/indexed). On retry, skip finished chunks; dead-letter poison chunks after
   N tries so the rest of the doc still completes (partial progress).
4. **Idempotency keys** wherever at-least-once delivery meets a side effect: dedup **upload by
   content hash** (same file → same docId), **chunk id** for idempotent embed + index upserts,
   and **Service Bus duplicate detection** on the work-item id.
5. **Sync vs event-driven.** Only the **upload accept** is synchronous — validate, land the
   blob, return `202` + a tracking id. Everything heavy is **event-driven**
   (`UploadAccepted → ChunkCreated → EmbeddingGenerated → Indexed → DocumentReady`), with
   progress via polling/SignalR. **Durable intent:** the upload is accepted and *will* complete
   even if embedding is throttled or OpenAI is down — the queue replays on recovery.

---

_Last updated: 2026-07-06 · Phase 0.5 complete (CI/CD)._
