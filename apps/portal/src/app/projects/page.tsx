import { PageHeader, Card } from "@/components/ui";

export const metadata = { title: "Projects" };

type ProjectStatus = "live" | "building" | "planned";

const projects: {
  name: string;
  tagline: string;
  status: ProjectStatus;
  kind: "app" | "service";
  path: string;
}[] = [
  {
    name: "Developer Portal",
    tagline: "The Azure Portal for Nimbus — the front door to every capability.",
    status: "building",
    kind: "app",
    path: "apps/portal",
  },
  {
    name: "Platform API",
    tagline: "The core Python Functions service. Health, and the contract everything builds on.",
    status: "building",
    kind: "service",
    path: "services/api",
  },
  {
    name: "AI Assistant",
    tagline: "RAG assistant over platform docs and runbooks. Rewrite of the parked C# prototype.",
    status: "planned",
    kind: "service",
    path: "services/ai",
  },
  {
    name: "Telemetry",
    tagline: "Metrics and logs pipeline for every service on the platform.",
    status: "planned",
    kind: "service",
    path: "services/telemetry",
  },
  {
    name: "Notifications",
    tagline: "Event-driven notifications delivered to engineers.",
    status: "planned",
    kind: "service",
    path: "services/notifications",
  },
];

const statusStyle: Record<ProjectStatus, string> = {
  live: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  building: "border-azure-500/30 bg-azure-500/10 text-azure-300",
  planned: "border-white/10 bg-white/5 text-slate-400",
};

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Projects"
        title="Applications on the platform"
        lede="Every project is a tenant running on Nimbus. Apps live in apps/, platform capabilities live in services/ — and each one has a documented scale journey."
      />

      <div className="grid gap-3">
        {projects.map((p) => (
          <Card key={p.name} className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{p.name}</span>
                  <span className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                    {p.kind}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{p.tagline}</p>
              </div>
              <span
                className={[
                  "shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize",
                  statusStyle[p.status],
                ].join(" ")}
              >
                {p.status}
              </span>
            </div>
            <code className="w-fit rounded bg-ink-950/60 px-2 py-1 font-mono text-xs text-slate-500">
              {p.path}
            </code>
          </Card>
        ))}
      </div>
    </div>
  );
}
