# ADR 0002 — Python for platform services

- **Status:** Accepted
- **Date:** 2026-07-02

## Context

Every capability under `services/` needs one backend language. Early exploration used
C# (.NET) for an "AI Ops Assistant" prototype (now parked). Nimbus's near-term roadmap is
heavy on AI/data work: a RAG assistant, embeddings, search, and eventual data pipelines.
We want one language across services so shared clients, testing, and mental model stay
consistent.

## Decision

Use **Python 3.11 (Azure Functions v2 model)** for all `services/`. TypeScript remains the
language for `apps/` and shared UI in `packages/`. The parked C# prototype will be
rewritten in Python when it folds into `services/ai`.

## Alternatives considered

- **C# / .NET isolated** — excellent performance and typing, first-class on Azure
  Functions. But the AI/ML ecosystem (LangChain-style tooling, vector libs, data science)
  is weaker and slower-moving than Python's, and we'd fight the ecosystem later.
- **TypeScript/Node for services too** — one language for the whole repo. Rejected because
  the AI/data story in Python is materially stronger, and mixing concerns (UI vs. data/AI)
  by language keeps boundaries crisp.

## Consequences

- The AI-heavy phases (RAG, embeddings, evaluation) sit in the strongest ecosystem.
- Consistent `handlers → services → repositories` structure and Pydantic validation across
  every service.
- Trade-off: Python cold starts on Consumption are a bit higher than .NET; tracked in
  [scaling.md](../scaling.md) with a mitigation path (Premium → Container Apps).
- One-time cost: rewrite the parked C# prototype in Python for `services/ai`.
