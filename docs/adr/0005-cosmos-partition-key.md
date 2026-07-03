# ADR 0005 — Cosmos DB partition key strategy

- **Status:** Accepted (Phase 0) · revisit at multi-tenant / growth
- **Date:** 2026-07-02

## Context

The `journal` container uses `/id` as its partition key. Our "list entries" query —
`SELECT ... FROM c ORDER BY c.date DESC` — failed until we explicitly enabled a
**cross-partition query**. This is a direct DDIA *Partitioning* lesson worth recording.

**Why did it become cross-partition?** The partition key decides where a document lives.
With `/id` (a unique value per entry), **every entry is its own logical partition**. A
query with no partition-key filter must therefore fan out to *all* partitions
(scatter-gather) and merge — that's the cross-partition requirement, and its cost grows
with the data.

## Decision

For Phase 0, keep `/id` as the partition key. It is the simplest choice, distributes writes
perfectly, and never hits the 20 GB / 10k-RU single-logical-partition ceiling. We accept
that "list / list-recent" is a cross-partition fan-out — negligible at tens of entries.

## Alternatives considered

- **Single fixed bucket key** (e.g. all journal docs under `"journal"`) — makes list a
  cheap single-partition read, but concentrates all writes into one logical partition and
  caps it at 20 GB / 10k RU. A scaling dead-end.
- **Partition by `tenantId`** (when Nimbus becomes multi-tenant) — the DDIA-correct answer:
  common queries ("this tenant's entries") become single-partition, writes spread across
  tenants, and it aligns storage locality with the access pattern.
- **Partition by time bucket** (e.g. `YYYY-MM`) — bounds partition size and makes
  recent-entry queries touch few partitions; good for append-heavy logs.

## Consequences

- Cheap and simple now; correctness is fine, only RU cost scales with fan-out.
- **Revisit trigger:** when we add multi-tenancy or entry volume grows, migrate to
  `tenantId` (or a composite `tenantId` + time bucket) so the hot queries are
  single-partition. That will be a data migration, documented as a superseding ADR.

## What breaks at 10M users?

Cross-partition scatter-gather on a large container burns RU and latency linearly with
partition count. The fix is to **align the partition key with the dominant query** so reads
stay single-partition, and to add composite indexes for multi-field sorts. Partition-key
choice is the single most consequential Cosmos decision — this ADR exists so we choose it
deliberately, not by default.

## Triggers to revisit

- Multi-tenancy arrives → partition by `tenantId` (or a hierarchical key).
- A hot partition, or the 20 GB / 10k-RU logical-partition limit, is approached.
- Cross-partition RU cost or query latency becomes material.
