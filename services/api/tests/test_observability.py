import json
import logging

import azure.functions as func
import pytest

from observability import CORRELATION_HEADER, correlation_id, observed


def _request(headers: dict[str, str] | None = None) -> func.HttpRequest:
    return func.HttpRequest(
        method="GET",
        url="http://localhost/api/test",
        headers=headers or {},
        params={},
        route_params={},
        body=b"",
    )


def _events(caplog: pytest.LogCaptureFixture) -> list[dict[str, object]]:
    return [json.loads(record.message) for record in caplog.records]


def test_correlation_id_prefers_explicit_header() -> None:
    request = _request(
        {
            CORRELATION_HEADER: "explicit-correlation",
            "traceparent": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
        }
    )

    assert correlation_id(request) == "explicit-correlation"


def test_correlation_id_uses_w3c_trace_id() -> None:
    request = _request(
        {"traceparent": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01"}
    )

    assert correlation_id(request) == "4bf92f3577b34da6a3ce929d0e0e4736"


def test_correlation_id_generates_32_character_hex_id() -> None:
    generated = correlation_id(_request())

    assert len(generated) == 32
    assert int(generated, 16) >= 0


def test_observed_logs_lifecycle_and_echoes_correlation_id(
    caplog: pytest.LogCaptureFixture,
) -> None:
    @observed("test.route")
    def handler(request: func.HttpRequest) -> func.HttpResponse:
        return func.HttpResponse("ok", status_code=201)

    with caplog.at_level(logging.INFO, logger="nimbus-api"):
        response = handler(_request({CORRELATION_HEADER: "request-123"}))

    events = _events(caplog)
    assert response.status_code == 201
    assert response.headers[CORRELATION_HEADER] == "request-123"
    assert [event["event"] for event in events] == ["request.start", "request.end"]
    assert all(event["correlationId"] == "request-123" for event in events)
    assert events[1]["status"] == 201
    assert isinstance(events[1]["durationMs"], float)


def test_observed_logs_error_and_reraises(
    caplog: pytest.LogCaptureFixture,
) -> None:
    @observed("test.failure")
    def handler(request: func.HttpRequest) -> func.HttpResponse:
        raise RuntimeError("expected failure")

    with caplog.at_level(logging.INFO, logger="nimbus-api"):
        with pytest.raises(RuntimeError, match="expected failure"):
            handler(_request({CORRELATION_HEADER: "request-456"}))

    events = _events(caplog)
    assert [event["event"] for event in events] == ["request.start", "request.error"]
    assert events[1]["correlationId"] == "request-456"
    assert events[1]["error"] == "expected failure"