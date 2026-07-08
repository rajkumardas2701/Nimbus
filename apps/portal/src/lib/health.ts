import { newCorrelationId, logServer } from "./observability";

/** Contract returned by every Nimbus service's `GET /api/health`. */
export type HealthPayload = {
  status: string;
  service: string;
  version: string;
};

export type ServiceHealth =
  | { state: "up"; payload: HealthPayload; url: string }
  | { state: "down"; error: string; url: string };

const API_BASE = process.env.NIMBUS_API_URL ?? "http://localhost:7071";

/** Server-side health probe. Never throws — a down service is a normal state to render. */
export async function checkApiHealth(): Promise<ServiceHealth> {
  const url = `${API_BASE}/api/health`;
  const correlationId = newCorrelationId();
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
      headers: { "x-correlation-id": correlationId },
    });
    if (!res.ok) {
      logServer("api.health.error", { correlationId, status: res.status });
      return { state: "down", error: `HTTP ${res.status}`, url };
    }
    const payload = (await res.json()) as HealthPayload;
    return { state: "up", payload, url };
  } catch (err) {
    const error = err instanceof Error ? err.message : "unreachable";
    logServer("api.health.unreachable", { correlationId, error });
    return { state: "down", error, url };
  }
}
