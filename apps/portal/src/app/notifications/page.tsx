import { ComingSoon } from "@/components/ComingSoon";

export const metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <ComingSoon
      eyebrow="Capability"
      title="Notifications"
      phase="Phase 2 (10,000 users)"
      description="An event-driven notification service that delivers platform events to engineers — built on managed messaging, designed to avoid becoming a bottleneck as load grows."
      plannedCapabilities={[
        "Event-driven delivery",
        "Managed messaging (Service Bus / Event Grid)",
        "Fan-out to multiple channels",
        "Retry & dead-letter handling",
        "Per-tenant rate limiting",
        "Delivery status tracking",
      ]}
    />
  );
}
