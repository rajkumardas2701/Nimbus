# ADR 0010 — Observability foundation (before AI)

- **Status:** Accepted
- **Date:** 2026-07-08

## Context

The roadmap deliberately puts **observability before the AI Assistant**: debugging an AI
service without traces, correlation, and metrics is painful; with distributed tracing it's
tractable. Every Nimbus service should emit **structured logs, traces, metrics, and
correlation IDs**. Our tech stack commits to "Application Insights → OpenTelemetry".

## Decision

- **One workspace-based Application Insights** (`nimbus-insights`) backed by a Log Analytics
  workspace (`nimbus-logs`) — a single pane for the whole platform.
- **API (Python Functions)** — auto-instrumented via `APPLICATIONINSIGHTS_CONNECTION_STRING`
  (requests, Cosmos dependencies, traces, live metrics). An `@observed` decorator adds a
  **correlation id** (`x-correlation-id` → W3C `traceparent` → generated), structured
  `request.start/end/error` logs with duration, and echoes the correlation header — keeping
  handlers thin.
- **Portal (Next.js)** — the **Azure Monitor OpenTelemetry** SDK, initialized in Next's
  `instrumentation.ts`. It auto-collects incoming requests and outgoing dependency calls and
  emits distributed traces. The portal **propagates a correlation id** to the API on every
  call.
- Both tiers report to the **same Application Insights**, so a portal request → API request →
  Cosmos dependency stitch into one end-to-end transaction.

## Alternatives considered

- **Console logs only** — no traces, metrics, or cross-tier correlation; can't follow a
  request across services. Insufficient for an async, multi-service future.
- **Third-party APM (Datadog / Grafana Cloud)** — capable, but not Azure-native, more cost and
  setup. App Insights is the managed-first choice; building on **OpenTelemetry** keeps us
  portable if that changes.

## Consequences

- The AI service (next) lands into a platform that is **already debuggable** — distributed
  tracing from day one, exactly why observability came first.
- The portal is instrumented with **OpenTelemetry**, so App Insights is just the exporter —
  vendor-neutral, on the documented evolution path.
- Costs: App Insights ingestion (sampling enabled) and one portal dependency.

## Triggers to revisit

- Trace/log **volume or cost** grows → tune (adaptive) sampling or add an OTel collector.
- Need **custom business metrics / dashboards** → metric emitters + Azure Workbooks.
- We swap the telemetry backend → change the **OTel exporter** only (instrumentation stays).
- The AI pipeline needs **span-level** tracing across the queue → propagate context through
  Service Bus messages.

## Known refinement

Portal → API calls are traced as **dependencies** and correlated via an explicit
`x-correlation-id` (logged + echoed by the API). However, the Python Functions request does
not yet inherit the portal's W3C `operation_Id`, so the two tiers don't auto-stitch into a
single App Insights transaction. Closing this means adding **OpenTelemetry instrumentation to
the Functions worker** (honoring inbound `traceparent`) — a deliberate follow-up, not a
Phase-1 blocker, since the explicit correlation id already ties the logs together.
