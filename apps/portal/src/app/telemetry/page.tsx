import { ComingSoon } from "@/components/ComingSoon";

export const metadata = { title: "Telemetry" };

export default function TelemetryPage() {
  return (
    <ComingSoon
      eyebrow="Capability"
      title="Telemetry"
      phase="Phase 2 (10,000 users)"
      description="A metrics and logs pipeline for every service on the platform — starting with Application Insights and evolving toward OpenTelemetry as the platform goes multi-service."
      plannedCapabilities={[
        "Structured logs from every service",
        "Request & dependency metrics",
        "Application Insights first",
        "OpenTelemetry when multi-service",
        "Per-service health dashboards",
        "Correlation IDs across calls",
      ]}
    />
  );
}
