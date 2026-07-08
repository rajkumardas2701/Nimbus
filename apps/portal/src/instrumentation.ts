/**
 * Next.js instrumentation hook — runs once at server startup.
 * Initializes the Azure Monitor OpenTelemetry SDK so the portal emits requests,
 * outgoing dependency calls (incl. the API fetch), and distributed traces to
 * Application Insights. Connection string + role name come from app settings
 * (APPLICATIONINSIGHTS_CONNECTION_STRING, OTEL_SERVICE_NAME).
 */
export async function register() {
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
  ) {
    const { useAzureMonitor } = await import("@azure/monitor-opentelemetry");
    useAzureMonitor();
  }
}
