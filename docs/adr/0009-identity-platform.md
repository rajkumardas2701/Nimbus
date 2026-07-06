# ADR 0009 — Authentication as an identity platform

- **Status:** Accepted
- **Date:** 2026-07-06

## Context

Nimbus needs to know its users. The naive move is a **login gate** ("are you
authenticated?"). But the platform will eventually need identity, tenant, roles,
permissions, and feature flags — an internal **identity layer**, not just a sign-in button.
Per Principle #11 (build for consumers), this should be a capability other services can build
on, not a one-off page check.

## Decision

Build authentication as an **identity platform** in three separable layers:

1. **Authentication — EasyAuth / Entra ID, allow-anonymous.** App Service EasyAuth handles the
   OIDC flow with Entra ID, with `unauthenticatedClientAction = AllowAnonymous`: the portal
   stays publicly browsable and asks *"who is this user?"* instead of gating everything.
   Signing in unlocks capabilities.
2. **Identity layer (`lib/identity.ts`).** Reads the EasyAuth principal header into a typed
   `NimbusUser` (id, email, name, tenantId, roles, provider). A dev-only `NIMBUS_DEV_USER`
   fallback lets local development run without EasyAuth; **production is never mocked**.
3. **Authorization layer (`lib/authz.ts`).** A **policy registry** — named, described
   predicates over the user — with a single entry point `can(user, policy)`. We start with one
   policy (`platform.admin`) and grow deliberately. Never scattered `if (isAdmin)`.

Admin is bootstrapped via an email allowlist (`NIMBUS_ADMIN_EMAILS`) until Entra **app-role
assignment** replaces it.

For Phase 1 the **portal is the BFF (backend-for-frontend) and trust boundary** — it enforces
identity and authorization, while the API stays internal (anonymous behind it) and earns its
own auth contract when it gains external consumers (Principle #11). The issuer is
**single-tenant** for now (one tenant = the platform owner).

## Alternatives considered

- **Login gate / require-authentication** — simplest, but makes the portal private and
  conflates authentication with authorization. Rejected: Nimbus is a public showcase and needs
  "who", not merely "authenticated".
- **Scattered role checks (`if user.isAdmin`)** — fast today, unmaintainable as policies grow;
  can't answer "what can this user do?" in one place.
- **Custom auth (MSAL in the app)** — more control, but more surface area and token handling;
  managed EasyAuth is sufficient and keeps secrets out of the app.

## Consequences

- Identity, authorization, and partitioning remain **separate concerns** (Principle #9) that
  evolve independently.
- One place (`can`) answers every access question; the policy registry is the growth point.
- The portal **degrades gracefully** for anonymous users (browse yes, manage no).
- Costs: an Entra app + client secret held by App Service (never in git); an allowlist
  bootstrap until app roles land.

## Triggers to revisit

- Fine-grained **permissions / feature flags** beyond a few policies → a dedicated
  authorization service (Cedar/OPA-style policies, or Entra app roles + groups).
- The **API** (not just the portal) needs to authorize calls → move identity/authz into a
  **shared package** consumable by services (Principle #11).
- Multi-tenant **role-management UI** is required.
- Secret-rotation burden → move the Entra client secret to Key Vault or a federated credential.
