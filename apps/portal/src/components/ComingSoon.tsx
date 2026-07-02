import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui";

/** Placeholder page for platform capabilities not yet built (Phase 1+). */
export function ComingSoon({
  eyebrow,
  title,
  phase,
  description,
  plannedCapabilities,
}: {
  eyebrow: string;
  title: string;
  phase: string;
  description: ReactNode;
  plannedCapabilities: string[];
}) {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader eyebrow={eyebrow} title={title} lede={description} />

      <div className="flex items-center gap-3 rounded-xl border border-azure-500/20 bg-azure-500/5 px-5 py-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-azure-500/15 text-azure-300">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path
              d="M12 8v4l2.5 2.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div>
          <p className="text-sm font-medium text-white">Coming soon</p>
          <p className="text-sm text-slate-400">
            Scheduled for <span className="text-azure-300">{phase}</span> of the Nimbus
            roadmap.
          </p>
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
          Planned capabilities
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {plannedCapabilities.map((cap) => (
            <li
              key={cap}
              className="flex items-center gap-2 rounded-lg border border-white/5 bg-ink-900/40 px-3 py-2 text-sm text-slate-300"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
              {cap}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
