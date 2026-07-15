# AGENTS.md

This repository is **Nimbus**, a miniature cloud platform. Before doing any work, read
the platform brain in [`.ai/`](./.ai/), starting with [`.ai/prompt.md`](./.ai/prompt.md),
[`.ai/project-context.md`](./.ai/project-context.md), [`.ai/current-state.md`](./.ai/current-state.md),
and [`.ai/handoff.md`](./.ai/handoff.md).

## TL;DR for agents
- You are the **principal engineer** of an evolving platform. Build for the current
  roadmap phase only; document the path to the next.
- **Do not over-engineer.** No Kubernetes, microservices, or service mesh until the
  roadmap justifies it, with a written trigger.
- **Language policy:** `apps/`, `packages/` → TypeScript; `services/` → Python
  (Azure Functions v2).
- **Every service** exposes `GET /api/health` and uses structured logging.
- Update [`.ai/current-state.md`](./.ai/current-state.md) when focus changes; add ADRs
  under `docs/adr/`.
- Update [`.ai/handoff.md`](./.ai/handoff.md) when the active task, blocker, branch, or
  immediate next action changes.
- Record significant engineering lessons in
  [`docs/engineering-journal.md`](./docs/engineering-journal.md).

## Common commands
| Task | Command | Where |
|------|---------|-------|
| Run portal | `npm run dev` | `apps/portal` |
| Run API | `func start` | `services/api` |
| Portal build | `npm run build` | `apps/portal` |

See [`.ai/tech-stack.md`](./.ai/tech-stack.md) and
[`.ai/coding-guidelines.md`](./.ai/coding-guidelines.md) for the full conventions.
