import { PageHeader, Card } from "@/components/ui";
import { getJournalEntries } from "@/lib/journal";

export const metadata = { title: "Learning Journal" };

// Always fresh — reflects the latest entries persisted through the API.
export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const { entries, source } = await getJournalEntries();

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Learning Journal"
        title="Decisions, lessons, and the road behind us"
        lede="A running log of what changed and why — the human side of the platform's evolution. DDIA, system design, and Azure lessons land here as they happen."
      />

      <div className="flex items-center gap-2 text-xs">
        <span
          className={[
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
            source === "api"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-white/10 bg-white/5 text-slate-400",
          ].join(" ")}
        >
          <span
            className={[
              "h-1.5 w-1.5 rounded-full",
              source === "api" ? "bg-emerald-400" : "bg-slate-500",
            ].join(" ")}
          />
          {source === "api" ? "Live from Cosmos DB" : "Offline — local fallback"}
        </span>
        <span className="text-slate-600">{entries.length} entries</span>
      </div>

      <div className="flex flex-col gap-4">
        {entries.map((entry) => (
          <Card key={entry.id}>
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
