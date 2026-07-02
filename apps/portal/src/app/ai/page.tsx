import { ComingSoon } from "@/components/ComingSoon";

export const metadata = { title: "AI Assistant" };

export default function AiAssistantPage() {
  return (
    <ComingSoon
      eyebrow="Capability"
      title="AI Assistant"
      phase="Phase 1 (100 users)"
      description="A retrieval-augmented assistant that answers questions over Nimbus documentation, runbooks, and architecture — grounded, with citations back to the source."
      plannedCapabilities={[
        "RAG over platform docs & runbooks",
        "Grounded answers with citations",
        "Azure OpenAI (chat + embeddings)",
        "Rewrite of the parked C# prototype in Python",
        "Per-tenant knowledge isolation",
        "Streamed responses in the portal",
      ]}
    />
  );
}
