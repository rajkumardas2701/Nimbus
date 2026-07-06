import { PageHeader, Card } from "@/components/ui";
import { getCurrentUser } from "@/lib/identity";
import { policies, can, type PolicyName } from "@/lib/authz";

export const metadata = { title: "Account" };

// Identity is per-request — never cache this page.
export const dynamic = "force-dynamic";

const LOGIN = "/.auth/login/aad?post_login_redirect_uri=/account";
const LOGOUT = "/.auth/logout?post_logout_redirect_uri=/";

export default async function AccountPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Identity"
        title="Your account"
        lede="Nimbus asks 'who is this user?' — identity, tenant, and roles flow from Entra ID into a policy layer that decides what you can do. Authorization is a separate concern from identity."
      />

      {!user ? (
        <Card>
          <p className="text-sm text-slate-300">You&apos;re browsing Nimbus anonymously.</p>
          <p className="mt-1 text-sm text-slate-500">
            Sign in with your Microsoft account to see your identity and unlock
            role-gated capabilities.
          </p>
          <a
            href={LOGIN}
            className="mt-4 inline-flex rounded-lg bg-azure-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-azure-400"
          >
            Sign in with Microsoft
          </a>
        </Card>
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              Identity
            </h2>
            <Card>
              <dl className="grid gap-4 sm:grid-cols-2">
                <Detail label="Name" value={user.name} />
                <Detail label="Email" value={user.email} />
                <Detail label="Tenant" value={user.tenantId} mono />
                <Detail label="Provider" value={user.identityProvider} />
                <div className="sm:col-span-2">
                  <dt className="text-[11px] uppercase tracking-wide text-slate-600">Roles</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {user.roles.map((r) => (
                      <span
                        key={r}
                        className="rounded-full border border-azure-500/30 bg-azure-500/10 px-2 py-0.5 text-xs text-azure-300"
                      >
                        {r}
                      </span>
                    ))}
                  </dd>
                </div>
              </dl>
            </Card>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              Policies
            </h2>
            <p className="text-sm text-slate-400">
              What you can do is decided by named policies evaluated against your identity —
              never scattered role checks.
            </p>
            <div className="grid gap-2">
              {(Object.keys(policies) as PolicyName[]).map((name) => {
                const allowed = can(user, name);
                return (
                  <div
                    key={name}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-ink-900/40 px-4 py-3"
                  >
                    <div>
                      <code className="font-mono text-sm text-slate-200">{name}</code>
                      <p className="text-xs text-slate-500">{policies[name].describe}</p>
                    </div>
                    <span
                      className={[
                        "shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                        allowed
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : "border-white/10 bg-white/5 text-slate-400",
                      ].join(" ")}
                    >
                      {allowed ? "Allowed" : "Denied"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <a
            href={LOGOUT}
            className="w-fit rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5"
          >
            Sign out
          </a>
        </>
      )}
    </div>
  );
}

function Detail({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-slate-600">{label}</dt>
      <dd className={["mt-0.5 text-sm text-slate-200", mono ? "font-mono text-xs" : ""].join(" ")}>
        {value ?? "—"}
      </dd>
    </div>
  );
}
