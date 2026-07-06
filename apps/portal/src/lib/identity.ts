import { headers } from "next/headers";

/**
 * The Nimbus identity model. The platform asks "who is this user?" — not merely
 * "are they authenticated?". Identity, tenant, and roles flow from Entra ID (via
 * App Service EasyAuth) into this typed shape, which the authorization layer consumes.
 */
export type NimbusUser = {
  id: string;
  email: string | null;
  name: string | null;
  tenantId: string | null;
  roles: string[];
  identityProvider: string;
};

// App Service EasyAuth injects the authenticated principal as a base64 JSON header.
const PRINCIPAL_HEADER = "x-ms-client-principal";

type EasyAuthClaim = { typ: string; val: string };
type EasyAuthPrincipal = {
  auth_typ?: string;
  name_typ?: string;
  role_typ?: string;
  claims?: EasyAuthClaim[];
};

function firstClaim(claims: EasyAuthClaim[], ...types: string[]): string | null {
  for (const t of types) {
    const c = claims.find((x) => x.typ === t);
    if (c) return c.val;
  }
  return null;
}

const ADMIN_EMAILS = (process.env.NIMBUS_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Resolve the current user from the EasyAuth principal header. Returns null when the
 * request is anonymous. In non-production, an opt-in `NIMBUS_DEV_USER` provides a mock
 * user so local development works without EasyAuth (prod is never mocked).
 */
export async function getCurrentUser(): Promise<NimbusUser | null> {
  const raw = (await headers()).get(PRINCIPAL_HEADER);

  let principal: EasyAuthPrincipal | null = null;
  if (raw) {
    try {
      principal = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
    } catch {
      principal = null;
    }
  }

  if (!principal) {
    if (process.env.NODE_ENV !== "production" && process.env.NIMBUS_DEV_USER) {
      return devUser(process.env.NIMBUS_DEV_USER);
    }
    return null;
  }

  const claims = principal.claims ?? [];
  const email = firstClaim(
    claims,
    "preferred_username",
    "emails",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  );
  const name = firstClaim(claims, "name");
  const tenantId = firstClaim(
    claims,
    "http://schemas.microsoft.com/identity/claims/tenantid",
    "tid",
  );
  const objectId = firstClaim(
    claims,
    "http://schemas.microsoft.com/identity/claims/objectidentifier",
    "oid",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
  );

  const roleType = principal.role_typ ?? "roles";
  const roles = claims
    .filter((c) => c.typ === roleType || c.typ === "roles")
    .map((c) => c.val);

  // Bootstrap admin via an allowlist until Entra app-role assignment lands (see ADR-0009).
  if (email && ADMIN_EMAILS.includes(email.toLowerCase()) && !roles.includes("administrator")) {
    roles.push("administrator");
  }
  if (roles.length === 0) roles.push("member");

  return {
    id: objectId ?? email ?? "unknown",
    email,
    name,
    tenantId,
    roles,
    identityProvider: principal.auth_typ ?? "aad",
  };
}

/** spec = "email" or "email:role1|role2" — dev only. */
function devUser(spec: string): NimbusUser {
  const [email, roleSpec] = spec.split(":");
  const roles = roleSpec ? roleSpec.split("|") : ["member"];
  return {
    id: email,
    email,
    name: email.split("@")[0],
    tenantId: "dev-tenant",
    roles,
    identityProvider: "dev",
  };
}
