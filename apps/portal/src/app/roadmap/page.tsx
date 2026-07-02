import { PageHeader } from "@/components/ui";

export const metadata = { title: "Roadmap" };

type Status = "done" | "in-progress" | "todo";

const roadmap: {
  phase: string;
  users: string;
  items: { label: string; status: Status }[];
}[] = [
  {
    phase: "Phase 0",
    users: "10 users · Foundation",
    items: [
      { label: "Developer Portal (apps/portal)", status: "in-progress" },
      { label: "Platform API (services/api) — Python /health", status: "in-progress" },
      { label: "Cosmos DB wiring", status: "todo" },
      { label: "Deploy portal + api to Azure", status: "todo" },
    ],
  },
  {
    phase: "Phase 1",
    users: "100 users",
    items: [
      { label: "Authentication (Entra ID / EasyAuth)", status: "todo" },
      { label: "AI Assistant (RAG) — rewrite the parked prototype in Python", status: "todo" },
    ],
  },
  {
    phase: "Phase 2",
    users: "10,000 users",
    items: [
      { label: "Telemetry service", status: "todo" },
      { label: "Notifications service", status: "todo" },
      { label: "Search (Azure AI Search)", status: "todo" },
      { label: "Documentation app", status: "todo" },
    ],
  },
  {
    phase: "Phase 3",
    users: "100,000 users",
    items: [
      { label: "Dockerize services", status: "todo" },
      { label: "GitHub Actions CI/CD", status: "todo" },
      { label: "Azure Container Registry", status: "todo" },
      { label: "Azure Container Apps", status: "todo" },
    ],
  },
  {
    phase: "Phase 4",
    users: "millions",
    items: [
      { label: "AKS", status: "todo" },
      { label: "GitOps (Flux / Argo)", status: "todo" },
      { label: "Observability (OpenTelemetry)", status: "todo" },
      { label: "Service Mesh", status: "todo" },
    ],
  },
];

const marker: Record<Status, { glyph: string; className: string }> = {
  done: { glyph: "✓", className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" },
  "in-progress": { glyph: "●", className: "border-azure-500/40 bg-azure-500/10 text-azure-300" },
  todo: { glyph: "", className: "border-white/10 bg-transparent text-slate-600" },
};

export default function RoadmapPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Roadmap"
        title="From 10 to 10 million users"
        lede="Every capability, in the order we build it. Each item earns an ADR when it ships, and records how it changes as load grows."
      />

      <div className="flex flex-col gap-8">
        {roadmap.map((phase) => (
          <section key={phase.phase} className="flex flex-col gap-3">
            <div className="flex items-baseline gap-3">
              <h2 className="text-lg font-semibold text-white">{phase.phase}</h2>
              <span className="text-xs text-slate-500">{phase.users}</span>
            </div>
            <ul className="flex flex-col gap-2">
              {phase.items.map((item) => {
                const m = marker[item.status];
                return (
                  <li
                    key={item.label}
                    className="flex items-center gap-3 rounded-lg border border-white/5 bg-ink-900/40 px-4 py-2.5"
                  >
                    <span
                      className={[
                        "grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[11px]",
                        m.className,
                      ].join(" ")}
                      aria-hidden="true"
                    >
                      {m.glyph}
                    </span>
                    <span
                      className={[
                        "text-sm",
                        item.status === "todo" ? "text-slate-400" : "text-slate-200",
                      ].join(" ")}
                    >
                      {item.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
