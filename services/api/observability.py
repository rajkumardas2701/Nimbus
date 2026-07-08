"""Observability primitives: correlation IDs + structured request logging.

Azure Functions ships requests, dependencies (incl. Cosmos), and `logging` output to
Application Insights automatically when APPLICATIONINSIGHTS_CONNECTION_STRING is set. This
module adds a **correlation id** (shared with the caller and the distributed trace) and
consistent structured logs, without fattening the handlers.
"""

import json
import logging
import time
import uuid
from functools import wraps

import azure.functions as func

from config import SERVICE_NAME

logger = logging.getLogger(SERVICE_NAME)

CORRELATION_HEADER = "x-correlation-id"


def correlation_id(req: func.HttpRequest) -> str:
    """Prefer an explicit correlation id, then the W3C trace id, else a new one."""
    explicit = req.headers.get(CORRELATION_HEADER)
    if explicit:
        return explicit
    traceparent = req.headers.get("traceparent")
    if traceparent:
        parts = traceparent.split("-")
        if len(parts) >= 2 and parts[1]:
            return parts[1]
    return uuid.uuid4().hex


def log_json(level: int, event: str, **fields) -> None:
    logger.log(level, json.dumps({"event": event, "service": SERVICE_NAME, **fields}))


def observed(route: str):
    """Wrap an HTTP handler with structured start/end/error logs + correlation echo."""

    def decorator(handler):
        @wraps(handler)
        def wrapper(req: func.HttpRequest) -> func.HttpResponse:
            cid = correlation_id(req)
            started = time.perf_counter()
            log_json(logging.INFO, "request.start", route=route, method=req.method, correlationId=cid)
            try:
                resp = handler(req)
            except Exception as exc:  # noqa: BLE001 - log then re-raise
                duration_ms = round((time.perf_counter() - started) * 1000, 1)
                log_json(
                    logging.ERROR, "request.error", route=route,
                    correlationId=cid, durationMs=duration_ms, error=str(exc),
                )
                raise
            duration_ms = round((time.perf_counter() - started) * 1000, 1)
            log_json(
                logging.INFO, "request.end", route=route,
                status=resp.status_code, durationMs=duration_ms, correlationId=cid,
            )
            try:
                resp.headers[CORRELATION_HEADER] = cid
            except Exception:  # noqa: BLE001 - header echo is best-effort
                pass
            return resp

        return wrapper

    return decorator
