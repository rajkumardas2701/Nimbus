---
description: "Backend conventions for Nimbus platform services (Python Azure Functions v2)."
applyTo: "services/**"
---

# Backend Instructions (services/)

- **Python 3.11**, Azure Functions **v2** programming model (`function_app.py` with
  decorators). Type hints everywhere; keep it `mypy`-clean.
- **Clean Architecture**: `handlers → services → repositories`. Handlers stay thin and
  never touch the database directly.
- **Dependency injection** over module-level globals — pass clients in.
- Every service exposes **`GET /api/health`** → `{ "status", "service", "version" }`.
- **Validate input at the boundary** with Pydantic models.
- **Structured JSON logging** via the `logging` module; no `print`. Include correlation IDs.
- Secrets from app settings / Key Vault — never hard-coded, never committed.
- Unit-test service logic; integration-test repository boundaries.
- Prefer Azure SDKs with `DefaultAzureCredential` (managed identity) over keys.

See [.ai/coding-guidelines.md](../../.ai/coding-guidelines.md) for the full rules.
