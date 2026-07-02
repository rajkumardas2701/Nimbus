export type JournalEntry = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  date: string;
};

export type JournalResult = {
  entries: JournalEntry[];
  /** Where the data came from — so the UI can be honest about live vs. offline. */
  source: "api" | "local";
};

const API_BASE = process.env.NIMBUS_API_URL ?? "http://localhost:7071";

/**
 * Local fallback so the portal renders even when the API is unreachable (offline dev,
 * static export/build time). The API is the source of truth when it's up.
 */
const localFallback: JournalEntry[] = [
  {
    id: "local-1",
    title: "Nimbus takes shape: the platform framing",
    body: "Reframed the whole effort from 'portfolio project' to 'one cloud platform with many apps'. Scaffolded the monorepo, the .ai brain docs, and the Developer Portal. Backend language locked to Python for services/.",
    tags: ["platform", "decision"],
    date: "2026-07-02",
  },
  {
    id: "local-2",
    title: "Why start with the portal, not auth or AI",
    body: "The portal is the front door every future capability plugs into. Building it first gives every later service a place to surface — and forces the platform's information architecture early.",
    tags: ["architecture"],
    date: "2026-07-02",
  },
];

/** Reads journal entries through the Platform API, falling back to local content. */
export async function getJournalEntries(): Promise<JournalResult> {
  try {
    const res = await fetch(`${API_BASE}/api/journal`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { entries: JournalEntry[] };
    if (!Array.isArray(data.entries) || data.entries.length === 0) {
      return { entries: localFallback, source: "local" };
    }
    return { entries: data.entries, source: "api" };
  } catch {
    return { entries: localFallback, source: "local" };
  }
}
