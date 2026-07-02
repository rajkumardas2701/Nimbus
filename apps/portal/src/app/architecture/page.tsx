import { PageHeader, Card } from "@/components/ui";

export const metadata = { title: "Architecture" };

const phases = [
  { name: "Phase 0 — 10 users", flow: "One Next.js app → One Azure Function (Python) → One Cosmos DB" },
  { name: "Phase 1 — 100 users", flow: "Developer Portal → Authentication (Entra ID) → AI Assistant (RAG)" },
  { name: "Phase 2 — 10,000 users", flow: "Telemetry → Notifications → Search → Documentation" },
  { name: "Phase 3 — 100,000 users", flow: "Containers → GitHub Actions → Container Registry → Container Apps" },
  { name: "Phase 4 — millions", flow: "AKS → GitOps → Observability → Service Mesh" },
];

const boundaries = [
  { dir: "apps/*", desc: "User-facing applications (portal, docs, playground). No platform business logic." },
  { dir: "services/*", desc: "Platform capabilities (api, auth, ai, notifications, telemetry). Each is independently deployable and owns its data." },
  { dir: "packages/*", desc: "Shared TypeScript / Python libraries — types, clients, UI." },
  { dir: "infrastructure/*", desc: "Bicep, Docker, GitHub Actions, Kubernetes." },
];

export default function ArchitecturePage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Architecture"
        title="How Nimbus is built — and how it grows"
        lede="The platform evolves. We never over-engineer, prefer Azure managed services, and only introduce heavy infrastructure when traffic, cost, or reliability demands it."
      />

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
          Phase 0 topology
        </h2>
        <Card>
          <pre className="overflow-x-auto font-mono text-sm leading-6 text-slate-300">
{`Engineer
   │
   ▼
apps/portal  (Next.js)
   │
   ▼
services/api  (Azure Functions · Python)
   │
   ├──▶ Cosmos DB
   └──▶ Application Insights`}
          </pre>
        </Card>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
          Evolution path
        </h2>
        <div className="flex flex-col gap-2">
          {phases.map((p) => (
            <div
              key={p.name}
              className="rounded-xl border border-white/5 bg-ink-900/40 px-5 py-4"
            >
              <p className="text-sm font-medium text-white">{p.name}</p>
              <p className="mt-1 font-mono text-xs leading-6 text-slate-400">{p.flow}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
          Repository boundaries
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {boundaries.map((b) => (
            <Card key={b.dir}>
              <code className="font-mono text-sm text-azure-300">{b.dir}</code>
              <p className="mt-1.5 text-sm leading-6 text-slate-400">{b.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
