# ADR 0007 — Keyless CI/CD via GitHub OIDC

- **Status:** Accepted
- **Date:** 2026-07-03

## Context

Manual deploys (build → zip → `az webapp deploy`, `func publish`) are error-prone and don't
scale as a habit. We want every push to `main` to deploy automatically. But the repo is
**public**, and ADR-0004 commits us to **zero stored secrets** — so publish profiles or a
service-principal password in GitHub secrets are off the table.

## Decision

Use **GitHub Actions with OIDC federated credentials**:

- An Entra app registration (`nimbus-github-actions`) with a **federated credential** scoped
  to `repo:rajkumardas2701/Nimbus:ref:refs/heads/main` — GitHub mints a short-lived token per
  run; no password exists.
- The app has **Contributor on `nimbus-rg` only** (least privilege, not subscription-wide).
- Only **non-sensitive IDs** (client/tenant/subscription) are stored as GitHub secrets.
- The workflow (`.github/workflows/deploy.yml`):
  - **path-filtered** — deploys the API only when `services/api/**` changes, the portal only
    when `apps/portal/**` changes;
  - **API** via `func azure functionapp publish --python --build remote`;
  - **portal** via a Next.js standalone build + `azure/webapps-deploy`;
  - a **post-deploy smoke test** hits `/api/health` and the portal home;
  - `workflow_dispatch` forces a full deploy for on-demand validation.

## Alternatives considered

- **Publish profile / SP secret in GitHub secrets** — simplest, but a long-lived stored
  credential to rotate and leak; contradicts ADR-0004.
- **Keep deploying manually** — no audit trail, easy to forget a step, and "works on my
  machine" drift.

## Consequences

- **No deployment credential exists to leak or rotate.** Access is a short-lived OIDC token
  bounded to the repo + `main`.
- Least-privilege blast radius (one resource group).
- Deploys are boring and repeatable; smoke test catches a broken deploy immediately.
- **Lessons learned (recorded so we don't repeat them):**
  - `func` needs an explicit `--python` in CI because `local.settings.json` (which declares
    the runtime) is gitignored.
  - `Azure/functions-action` deployed via run-from-package **without** building Python deps,
    leaving the app with zero registered functions (404). Remote build via `func` is the
    reliable path for Linux Consumption Python.

## What breaks at 10M users?

Nothing structural — CI/CD scales. As services multiply we split into path-filtered
per-service workflows, add environments (staging → prod) with approvals, and layer in
automated rollback on a failed smoke test.

## Triggers to revisit

- Multiple environments (staging → prod) with approval gates.
- Multi-region deployment, or blue/green + automated rollback.
- Self-hosted runners, or supply-chain signing / provenance (SLSA) requirements.
- Per-service workflows as services multiply.
