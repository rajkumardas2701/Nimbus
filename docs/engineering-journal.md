# Nimbus Engineering Journal

This is the narrative memory of Nimbus: problems encountered, decisions made, and lessons
learned. ADRs remain the authoritative decision records; this journal connects those decisions
to the platform's evolution and DDIA concepts.

## Entry template

### YYYY-MM-DD — Short title

**Problem:** What issue, constraint, or scaling challenge appeared?

**Decision:** What did we choose, and why now?

**DDIA connection:** Which reliability, scalability, partitioning, replication, or stream
processing concept shaped the choice?

**Tradeoffs:** What simplicity, cost, performance, or flexibility did we give up?

**Future trigger:** What measurable condition would make us revisit the decision?

**References:** Relevant ADRs, code, incidents, or measurements.

---

## 2026-07-02 — One platform, not a portfolio of demos

**Problem:** A collection of unrelated projects would show implementation breadth but not how
systems and engineering judgment evolve under real constraints.

**Decision:** Build Nimbus as one monorepo with user-facing apps, reusable platform
capabilities, shared packages, infrastructure, and a persistent architecture brain. Start with
one portal, one Function API, and one Cosmos database rather than pre-creating microservices.

**DDIA connection:** Evolvability and maintainability are system properties. Clear ownership
boundaries matter before distributed deployment boundaries do.

**Tradeoffs:** A monorepo requires discipline to prevent accidental coupling. It is less
organizationally isolated than a polyrepo but much cheaper for one builder and early change.

**Future trigger:** Split a capability only when ownership, compliance, release cadence, or CI
scale requires an independent repository or deployment boundary.

**References:** [ADR-0001](./adr/0001-monorepo-and-evolution.md),
[vision](../.ai/vision.md).

## 2026-07-02 — A simple partition key exposed a real scaling lesson

**Problem:** Listing Learning Journal entries required a cross-partition Cosmos query because
the Phase 0 container uses `/id`, placing each entry in a separate logical partition.

**Decision:** Keep `/id` while the dataset is tiny. The fan-out cost is negligible now and the
choice distributes writes, but record the migration trigger instead of pretending the default
key scales for every access pattern.

**DDIA connection:** Partitioning is driven by access patterns. Scatter-gather reads grow with
partition count, and no universal partition key optimizes every query.

**Tradeoffs:** Recent-entry reads consume more RU than a single-partition query. A future
partition-key change requires migration.

**Future trigger:** Multi-tenancy, material cross-partition RU cost, query latency, or a hot /
oversized logical partition.

**References:** [ADR-0005](./adr/0005-cosmos-partition-key.md),
[scaling](./scaling.md).

## 2026-07-02 — Slow AI work must not own portal availability

**Problem:** A synchronous `Portal -> API -> model` path would couple a fast user-facing
control plane to slow, bursty, throttle-prone model calls.

**Decision:** Accept AI work asynchronously: persist intent, enqueue it, process it with a
Function worker, write the response, and let the portal poll before later adopting push. Keep
Functions because they already provide independent scaling; containers solve no current need.

**DDIA connection:** Queue-based load leveling converts overload from contention into backlog.
At-least-once delivery requires idempotency, and asynchronous state introduces explicit
eventual consistency.

**Tradeoffs:** The UX must represent queued and processing states. The system gains a queue,
worker, response store, retries, and ordering questions.

**Future trigger:** Promote to streaming when polling harms UX; revisit Service Bus sessions
when concurrent messages require strict per-conversation ordering; change compute only when
runtime or scaling evidence triggers it.

**References:** [ADR-0006](./adr/0006-async-ai-requests.md), [NFRs](./nfr.md).

## 2026-07-03 — Deployment credentials should not exist

**Problem:** Manual deployments drift, but long-lived publish profiles or service-principal
passwords would create secrets to leak and rotate in a public repository.

**Decision:** Use GitHub OIDC federation, resource-group-scoped access, path-filtered deploys,
and post-deploy smoke tests. Use remote Python Functions builds after package deployment failed
to install dependencies and exposed no functions.

**DDIA connection:** Operability and repeatability are part of reliability. Automated health
checks reduce the interval between introducing and detecting a deployment failure.

**Tradeoffs:** Federation and Azure role assignments require more initial configuration than a
publish profile. The workflow is coupled to current Azure resource names.

**Future trigger:** Add environments, approvals, rollback, provenance, or per-service workflows
when release risk and service count justify them.

**References:** [ADR-0007](./adr/0007-keyless-cicd-oidc.md).

## 2026-07-06 — Authentication became a platform capability

**Problem:** A simple login gate would not provide a reusable model for tenant identity,
roles, permissions, and future feature policies. It would also make a public portfolio portal
needlessly private.

**Decision:** Let EasyAuth handle Entra sign-in while anonymous browsing remains available.
Translate its principal into a typed `NimbusUser`, then make authorization decisions through a
named policy registry. Keep identity, authorization, and storage partitioning separate.

**DDIA connection:** Security boundaries and data-locality boundaries solve different
problems. Conflating them creates brittle schemas and access rules.

**Tradeoffs:** The portal is the Phase 1 BFF and trust boundary; the internal API does not yet
have its own external authorization contract. An email allowlist temporarily bootstraps admin.

**Future trigger:** Add API-level authorization when external consumers arrive, use Entra app
roles when role management grows, and extract a shared identity package when multiple services
must evaluate policies.

**References:** [ADR-0009](./adr/0009-identity-platform.md).

## 2026-07-08 — Observability before the asynchronous boundary

**Problem:** Building AI first would create queue, model, and storage failures without a
reliable way to correlate a user's action across components.

**Decision:** Instrument the portal and API before AI. Use one workspace-backed Application
Insights resource, OpenTelemetry in the portal, structured API events, and explicit correlation
IDs propagated on calls.

**DDIA connection:** Distributed systems fail partially. Correlation and dependency telemetry
make those failures diagnosable rather than merely observable as a generic error.

**Tradeoffs:** Telemetry adds ingestion cost and SDK dependencies. Explicit correlation works,
but the Python Function request does not yet inherit the portal's W3C operation id for automatic
transaction stitching.

**Future trigger:** Add Function-worker OpenTelemetry context propagation with the AI queue,
tune sampling when cost grows, and add business metrics when operational questions require them.

**References:** [ADR-0010](./adr/0010-observability.md).

## 2026-07-14 — Project memory must survive chat history

**Problem:** The VS Code agent conversation was lost, making it expensive to reconstruct active
work even though the code and ADRs remained intact.

**Decision:** Treat repository documentation as architectural memory. Add a stable project
context map, a volatile handoff, a principal-engineer reasoning guide, and this journal. Wire
them into agent onboarding so every session begins from repository truth rather than chat state.

**DDIA connection:** Durable state belongs in a system of record, not an ephemeral process.
Chat is a cache of collaboration context; the repository is the durable log.

**Tradeoffs:** These documents require lightweight maintenance and can drift if status is copied
carelessly. Detailed facts remain canonical in focused docs and ADRs; the context file links to
them instead of replacing them.

**Future trigger:** Consolidate or automate generated indexes if manual duplication begins to
drift or onboarding time stops improving.

**References:** [project context](../.ai/project-context.md),
[handoff](../.ai/handoff.md), [current state](../.ai/current-state.md).

## 2026-07-15 — Observability is verified behavior, not installed SDKs

**Problem:** ADR-0010 and the repository showed portal/API instrumentation, but "observability
complete" had not been tested against live ingestion, correlation lookup, Cosmos dependencies,
or operational alerts.

**Decision:** Verify the production resources and setting names, generate correlated traffic,
query the workspace, add focused correlation/decorator tests, save standard KQL diagnostics, and
deploy reproducible API availability and failed-request alerts. Call the result an observability
foundation, not a finished capability.

**DDIA connection:** Partial failure is only manageable when evidence crosses boundaries. A
health endpoint proves availability, correlation reconstructs causality, and dependency spans
localize latency or failure to a downstream system.

**Tradeoffs:** The alerts evaluate but have no notification action until an Action Group is
chosen. Live verification also disproved an assumption: Cosmos SDK calls are not appearing as
dependency telemetry, so explicit SDK OpenTelemetry instrumentation remains necessary.

**Future trigger:** Add Cosmos SDK spans before relying on dependency telemetry for incidents;
add a notification destination when Nimbus has an operational recipient; propagate W3C context
through Service Bus when the AI publisher and worker are implemented.

**References:** [ADR-0010](./adr/0010-observability.md),
[observability runbook](./observability/README.md),
[alert definitions](../infrastructure/bicep/observability-alerts.bicep).
