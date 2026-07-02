"""Nimbus Platform API — Azure Functions (Python v2 model).

Handlers stay thin: they validate input, call into the service layer, and shape the
HTTP response. Business logic belongs in `services/`, data access in `repositories/`
(added as the API grows beyond Phase 0).
"""

import json
import logging

import azure.functions as func

from config import SERVICE_NAME, VERSION

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

logger = logging.getLogger(SERVICE_NAME)


def _json_response(payload: dict, status_code: int = 200) -> func.HttpResponse:
    return func.HttpResponse(
        json.dumps(payload),
        mimetype="application/json",
        status_code=status_code,
    )


@app.route(route="health", methods=["GET"])
def health(req: func.HttpRequest) -> func.HttpResponse:
    """Liveness contract shared by every Nimbus service."""
    logger.info(json.dumps({"event": "health_check", "service": SERVICE_NAME}))
    return _json_response(
        {"status": "ok", "service": SERVICE_NAME, "version": VERSION}
    )
