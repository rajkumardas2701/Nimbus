"""Nimbus Platform API — Azure Functions (Python v2 model).

Handlers stay thin: they validate input, call into the service layer, and shape the
HTTP response. Business logic belongs in `services/`, data access in `repositories/`.
"""

import json
import logging

import azure.functions as func
from pydantic import ValidationError

from config import SERVICE_NAME, VERSION
from clients import get_cosmos_client
from models import JournalEntryCreate
from repositories.journal_repository import JournalRepository
from services.journal_service import JournalService

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

logger = logging.getLogger(SERVICE_NAME)


def _json_response(payload: object, status_code: int = 200) -> func.HttpResponse:
    return func.HttpResponse(
        json.dumps(payload),
        mimetype="application/json",
        status_code=status_code,
    )


def _journal_service() -> JournalService:
    """Compose the journal use-case. Kept here so handlers receive a ready service."""
    return JournalService(JournalRepository(get_cosmos_client()))


@app.route(route="health", methods=["GET"])
def health(req: func.HttpRequest) -> func.HttpResponse:
    """Liveness contract shared by every Nimbus service."""
    logger.info(json.dumps({"event": "health_check", "service": SERVICE_NAME}))
    return _json_response(
        {"status": "ok", "service": SERVICE_NAME, "version": VERSION}
    )


@app.route(route="journal", methods=["GET"])
def journal_list(req: func.HttpRequest) -> func.HttpResponse:
    entries = _journal_service().list_entries()
    return _json_response({"entries": entries})


@app.route(route="journal", methods=["POST"])
def journal_create(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = JournalEntryCreate.model_validate_json(req.get_body())
    except ValidationError as exc:
        details = [
            {"field": ".".join(str(p) for p in e["loc"]), "message": e["msg"]}
            for e in exc.errors()
        ]
        return _json_response({"error": "invalid input", "details": details}, 400)

    created = _journal_service().create_entry(data)
    return _json_response(created, 201)
