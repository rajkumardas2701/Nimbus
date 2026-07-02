# Vision

**Nimbus** is a miniature cloud platform — built the way a real internal platform
(Microsoft, Netflix, Uber) is built, at 1/1000th the scale.

The goal is **not** to build a pile of unrelated demo apps. Every application is a
tenant *on* the platform. The portfolio website itself is just one app hosted on Nimbus.

A new engineer joining the company would visit `platform.rajkumardas.dev` and be able to:

- View documentation
- Chat with an AI assistant
- Search internal knowledge
- Monitor systems
- Deploy applications
- View logs
- Receive notifications
- Browse architecture
- Explore APIs

## What Nimbus must demonstrate

- Azure (managed-first)
- AI (RAG, assistants)
- Distributed Systems (DDIA in practice)
- Platform Engineering
- Kubernetes
- Observability
- CI/CD
- Event-Driven Architecture

## The one rule that shapes everything

Every component starts **simple** and has a **documented evolution path** from
**10 users → 10 million users**. We never throw code away. We evolve it.
