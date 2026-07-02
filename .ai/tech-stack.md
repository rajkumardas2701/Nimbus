# Tech Stack

Every choice must answer one question: **why this technology?**

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js (App Router) + TypeScript | SSR/SSG, routing, React ecosystem, deploys to Static Web Apps |
| Styling | Tailwind CSS | Fast, consistent, no CSS sprawl |
| Backend | Azure Functions (**Python**, v2 model) | Serverless, cheap, event-driven, scales to zero |
| Database | Cosmos DB (serverless) | Global replication, partitioning, single-digit-ms reads |
| Search | Azure AI Search | Hybrid + vector retrieval for RAG (added in Phase 2) |
| AI | Azure OpenAI | Managed GPT + embeddings for the AI assistant |
| Auth | Microsoft Entra ID | Enterprise identity, EasyAuth integration |
| Observability | Application Insights → OpenTelemetry | Azure-native first; OTel when multi-service |
| CI/CD | GitHub Actions | Native to the repo, free for public |
| Containers | Docker → ACR → Container Apps → AKS | The Phase 3→4 evolution path |
| IaC | Bicep | Azure-native, no state file to manage early |

## Language policy

- **TypeScript** for everything under `apps/` and shared UI/types in `packages/`.
- **Python** for everything under `services/` (Azure Functions, v2 programming model).
- The parked C# RAG prototype (`ai-ops-assistant`) will be **rewritten in Python**
  when it folds into `services/ai`.

## Versions (as of Phase 0)

- Node 22 · Next.js 15 · TypeScript 5
- Python 3.11 · Azure Functions Core Tools v4 · azure-functions (v2 model)
