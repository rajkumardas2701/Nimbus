---
description: "Frontend conventions for Nimbus apps and shared packages (Next.js + TypeScript)."
applyTo: "apps/**,packages/**"
---

# Frontend Instructions (apps/ + packages/)

- **TypeScript strict**; never use `any` (use `unknown` + narrowing).
- **Functional React** components with hooks only. Server Components by default;
  add `"use client"` only when interactivity requires it.
- **Feature-based folders** (`features/<feature>/…`), not type-based buckets.
- Colocate component + styles + tests.
- Every data fetch has explicit **loading and error** states.
- Tailwind for styling; keep class lists readable, extract components over long strings.
- Shared types/UI go in `packages/`, imported via the workspace alias — don't duplicate.
- Accessibility: semantic HTML, labelled controls, keyboard-navigable.

See [.ai/coding-guidelines.md](../../.ai/coding-guidelines.md) for the full rules.
