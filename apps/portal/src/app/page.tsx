import Link from "next/link";
import { Card } from "@/components/ui";

const phases = [
  { phase: "Phase 0", users: "10 users", focus: "Foundation — portal + one API + Cosmos", state: "current" },
  { phase: "Phase 1", users: "100 users", focus: "Auth + AI Assistant", state: "next" },
  { phase: "Phase 2", users: "10K users", focus: "Telemetry · Notifications · Search · Docs", state: "later" },
  { phase: "Phase 3", users: "100K users", focus: "Containers · CI/CD · Registry", state: "later" },
  { phase: "Phase 4", users: "Millions", focus: "AKS · GitOps · Observability · Mesh", state: "later" },
] as const;

const quickLinks = [
  { href: "/architecture", label: "Architecture", desc: "How the platform is built and how it evolves." },
  { href: "/roadmap", label: "Roadmap", desc: "Every capability from 10 to 10M users." },
  { href: "/projects", label: "Projects", desc: "Applications running on Nimbus." },
  { href: "/platform", label: "Platform Status", desc: "Live health of platform services." },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-5">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-azure-500/20 bg-azure-500/5 px-3 py-1 text-xs font-medium text-azure-300">
          <span className="h-1.5 w-1.5 rounded-full bg-azure-400" />
          Phase 0 · Foundation
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
          One platform. Many apps.{" "}
          <span className="bg-gradient-to-r from-azure-300 to-azure-500 bg-clip-text text-transparent">
            Built to scale from 10 to 10 million users.
          </span>
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-400">
          Nimbus is a miniature cloud platform — not a folder of demos. Every application
          is a tenant that runs on the platform. Each capability starts simple and has a
          documented path from a single team to millions of users.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/architecture"
            className="rounded-lg bg-azure-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-azure-400"
          >
            Explore the architecture
          </Link>
          <Link
            href="/roadmap"
            className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/5"
          >
            See the roadmap
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
          The evolution path
        </h2>
        <div className="flex flex-col gap-2">
          {phases.map((p) => (
            <div
              key={p.phase}
              className={[
                "flex flex-col gap-1 rounded-xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
                p.state === "current"
                  ? "border-azure-500/30 bg-azure-500/5"
                  : "border-white/5 bg-ink-900/40",
              ].join(" ")}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-white">{p.phase}</span>
                <span className="text-xs text-slate-500">{p.users}</span>
                {p.state === "current" && (
                  <span className="rounded-full bg-azure-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-azure-300">
                    You are here
                  </span>
                )}
              </div>
              <span className="text-sm text-slate-400">{p.focus}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
          Jump in
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className="group">
              <Card className="h-full transition-colors group-hover:border-azure-500/30">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{link.label}</span>
                  <span className="text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-azure-400">
                    →
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400">{link.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
