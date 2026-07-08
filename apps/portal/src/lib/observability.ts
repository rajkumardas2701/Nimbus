/**
 * Portal observability helpers. Full telemetry (requests, dependencies, distributed
 * traces) is auto-collected by the Azure Monitor OpenTelemetry SDK (see instrumentation.ts).
 * These helpers add an explicit correlation id + structured server logs so a portal
 * request can be tied to the API request it triggered.
 */

const ROLE = "nimbus-portal";

/** A compact correlation id propagated to the API via the `x-correlation-id` header. */
export function newCorrelationId(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

type LogFields = Record<string, unknown>;

/** Structured stdout line — captured by App Service log stream and Application Insights. */
export function logServer(event: string, fields: LogFields = {}): void {
  console.log(
    JSON.stringify({ ts: new Date().toISOString(), service: ROLE, event, ...fields }),
  );
}
