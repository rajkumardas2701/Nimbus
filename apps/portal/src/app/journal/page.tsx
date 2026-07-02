import { PageHeader, Card } from "@/components/ui";

export const metadata = { title: "Learning Journal" };

type Entry = {
  date: string;
  title: string;
  body: string;
  tags: string[];
};

// Newest first. Add an entry whenever a meaningful decision or lesson lands.
const entries: Entry[] = [
  {
    date: "2026-07-02",
    title: "Nimbus takes shape: the platform framing",
    body: "Reframed the whole effort from 'portfolio project' to 'one cloud platform with many apps'. Scaffolded the monorepo, the .ai brain docs, and the Developer Portal. Backend language locked to Python for services/.",
    tags: ["platform", "decision"],
  },
  {
    date: "2026-07-02",
    title: "Why start with the portal, not auth or AI",
    body: "The portal is the front door every future capability plugs into. Building it first gives every later service a place to surface — and forces the platform's information architecture early.",
    tags: ["architecture"],
  },
];

export default function JournalPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Learning Journal"
        title="Decisions, lessons, and the road behind us"
        lede="A running log of what changed and why — the human side of the platform's evolution. DDIA, system design, and Azure lessons land here as they happen."
      />

      <div className="flex flex-col gap-4">
        {entries.map((entry) => (
          <Card key={`${entry.date}-${entry.title}`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-medium text-white">{entry.title}</h2>
              <time className="shrink-0 font-mono text-xs text-slate-500">
                {entry.date}
              </time>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-400">{entry.body}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-slate-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
