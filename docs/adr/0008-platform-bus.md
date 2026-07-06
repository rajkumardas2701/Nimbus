# ADR 0008 — Event-driven Platform Bus

- **Status:** Proposed
- **Date:** 2026-07-06

## Context

Nimbus is turning from an app into a platform. Soon many services care about the same domain
facts: a new message arrived, a document was uploaded, an embedding or summary was generated.
If every producer calls every consumer directly, we get **N×M point-to-point coupling** — each
new capability means editing the existing services that produce the data it needs.

## Problem

Point-to-point integration doesn't scale — organizationally or technically. It creates tight
coupling and fragile change, and leaves no clean place for future services (telemetry,
notifications, audit, analytics, search) to plug in without modifying producers.

## Decision (proposed)

Introduce a **Platform Bus**: important things become **domain events**, published once, and
any service subscribes.

```
ConversationCreated · MessageReceived · DocumentUploaded ·
EmbeddingGenerated · SummaryGenerated · NotificationRequested
```

Producers emit events; consumers (Telemetry, Notifications, Audit, Analytics, Search) subscribe
independently. Start on **Azure Service Bus topics / Event Grid**; promote specific
high-throughput or replayable streams to **Event Hubs / Kafka** only when a trigger demands it.

## Alternatives considered

- **Point-to-point calls** — simplest for two services, but N×M coupling as services multiply.
- **Shared-DB polling** — brittle, couples schemas, and offers no clean fan-out.

## Consequences

- Loose coupling: new capabilities subscribe **without touching producers** — the platform
  becomes extensible, which is the whole point (Principle #11 — build for consumers).
- This is where Nimbus stops being an application and becomes a **platform**.
- Costs: eventing infrastructure, **event schema + versioning** discipline, and eventual
  consistency between producers and consumers.
- Enables **durable intent** and **degraded modes** — events buffer when a consumer is down.

## Triggers to revisit / to build

- **Build it** when a 2nd/3rd consumer of the same fact appears, or a cross-service workflow
  emerges.
- **Revisit the technology** (Event Hubs / Kafka) when throughput, replay, or streaming needs
  exceed Service Bus / Event Grid.
