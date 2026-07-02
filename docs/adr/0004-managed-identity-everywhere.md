# ADR 0004 — Managed identity everywhere, zero secrets

- **Status:** Accepted
- **Date:** 2026-07-02

## Context

The API reads and writes Cosmos DB. The classic approach ships a connection string or
account key in app settings (or Key Vault). Secrets leak, must be rotated, and are a
standing liability — especially in a **public** repository.

## Decision

**No keys anywhere.** Disable Cosmos local (key) auth entirely
(`disableLocalAuth=true`) and access data over Microsoft Entra ID (AAD):

- **Locally:** `DefaultAzureCredential` resolves to the developer's `az login`.
- **In Azure:** the Function App's **system-assigned managed identity**.
- Both principals are granted the **Cosmos DB Built-in Data Contributor** data-plane role
  (`00000000-0000-0000-0000-000000000002`).

The same `DefaultAzureCredential` code runs unchanged in both environments.

## Alternatives considered

- **Account key in app settings** — simplest, but a plaintext secret with full data access;
  unacceptable next to a public repo.
- **Connection string in Key Vault** — better, but it's still a secret with a rotation
  lifecycle, and adds a Key Vault dependency and reference plumbing for no security win over
  identity-based access.

## Consequences

- **Nothing to leak or rotate.** The repo, app settings, and CI contain no data credentials.
- Access is governed by RBAC role assignments, which are auditable and least-privilege.
- Trade-offs: RBAC assignments have a short **propagation delay**; local dev requires the
  developer to be `az login`'d and hold the data-plane role; the SDK must use the AAD code
  path (no key fallbacks).
- This principle extends to every future service (Search, Service Bus, Storage): identity
  first, secrets never.

## What breaks at 10M users?

Nothing about this pattern — it scales cleanly. At multi-region/multi-service scale we add
per-service identities and tighter, resource-scoped role assignments rather than a single
broad one.
