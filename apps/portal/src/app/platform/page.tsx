import { PageHeader, Card } from "@/components/ui";
import { checkApiHealth } from "@/lib/health";

export const metadata = { title: "Platform Status" };

// Always render fresh — health is a live signal.
export const dynamic = "force-dynamic";

export default async function PlatformStatusPage() {
  const api = await checkApiHealth();

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Platform Status"
        title="Live service health"
        lede="Every Nimbus service exposes a /health endpoint from day one. This page probes them directly — a production-shaped habit, even at 10 users."
      />

      <section className="flex flex-col gap-3">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                <span
                  className={[
                    "h-2.5 w-2.5 rounded-full",
                    api.state === "up" ? "bg-emerald-400" : "bg-rose-500",
                  ].join(" ")}
                  aria-hidden="true"
                />
                <span className="font-medium text-white">Platform API</span>
                <span className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                  service
                </span>
              </div>
              <code className="font-mono text-xs text-slate-500">{api.url}</code>
            </div>
            <span
              className={[
                "shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                api.state === "up"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-300",
              ].join(" ")}
            >
              {api.state === "up" ? "Healthy" : "Unreachable"}
            </span>
          </div>

          {api.state === "up" ? (
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-slate-600">Status</dt>
                <dd className="text-sm text-slate-200">{api.payload.status}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-slate-600">Service</dt>
                <dd className="text-sm text-slate-200">{api.payload.service}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-slate-600">Version</dt>
                <dd className="text-sm text-slate-200">{api.payload.version}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-slate-400">
              Couldn&apos;t reach the API ({api.error}). Start it locally with{" "}
              <code className="rounded bg-ink-950/60 px-1.5 py-0.5 font-mono text-xs text-slate-300">
                func start
              </code>{" "}
              in <code className="font-mono text-xs text-slate-300">services/api</code>, or
              set <code className="font-mono text-xs text-slate-300">NIMBUS_API_URL</code>.
            </p>
          )}
        </Card>
      </section>

      <p className="text-sm text-slate-500">
        More services (AI Assistant, Telemetry, Notifications) appear here as they come
        online in later phases.
      </p>
    </div>
  );
}
