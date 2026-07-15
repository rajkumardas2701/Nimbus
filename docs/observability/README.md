# Observability Runbook

## Purpose

Verify that Nimbus telemetry is arriving, follow a request across the portal/API/Cosmos path,
and triage failures without relying on transient chat or portal knowledge.

## Expected topology

- `nimbus-portal` emits server requests, dependencies, traces, and exceptions through Azure
  Monitor OpenTelemetry.
- `nimbus-platform-api` emits Functions requests, Cosmos dependencies, traces, and live metrics
  through Application Insights integration.
- Both report to workspace-based Application Insights `nimbus-insights`, backed by
  `nimbus-logs`.
- Portal calls include `x-correlation-id`; the API logs and echoes it.

## Live verification status

Verified on 2026-07-15 in the Visual Studio Enterprise personal subscription:

- `nimbus-portal`, `nimbus-platform-api`, `nimbus-insights`, `nimbus-logs`, and Cosmos exist in
  `nimbus-rg`.
- Every required portal/API observability setting name is present.
- `nimbus-portal` emits requests and dependencies.
- `nimbus-platform-api` emits requests and structured traces.
- The production health endpoint returns `200`, echoes `x-correlation-id`, and the ID is
  searchable in API traces.
- A standard API availability test runs every five minutes from three locations.
- Severity-1 availability and severity-2 failed-request alerts are enabled.

Open findings:

- No Cosmos dependencies appeared over seven days, including after exercising `/journal`.
- The alert rules have no notification actions because `nimbus-rg` has no Action Group yet.
- Portal/API events correlate explicitly, but W3C operation IDs do not auto-stitch.

## Verify Azure wiring

Authenticate to the account that owns the Nimbus personal subscription, then select it:

```powershell
az login
az account list --query "[].{Name:name, Id:id, Tenant:tenantId, Default:isDefault}" -o table
az account set --subscription "Visual Studio Enterprise"
az group show --name nimbus-rg --query "{name:name, location:location, state:properties.provisioningState}" -o table
```

Check only whether required setting names exist; do not print their values into logs or tickets:

```powershell
$portalSettings = az webapp config appsettings list `
  --resource-group nimbus-rg --name nimbus-portal | ConvertFrom-Json
$portalSettings.name | Where-Object { $_ -in @(
  "APPLICATIONINSIGHTS_CONNECTION_STRING", "OTEL_SERVICE_NAME", "NIMBUS_API_URL"
) }

$apiSettings = az functionapp config appsettings list `
  --resource-group nimbus-rg --name nimbus-platform-api | ConvertFrom-Json
$apiSettings.name | Where-Object { $_ -in @(
  "APPLICATIONINSIGHTS_CONNECTION_STRING", "COSMOS_ENDPOINT"
) }
```

Expected names:

| App | Required settings |
|-----|-------------------|
| Portal | `APPLICATIONINSIGHTS_CONNECTION_STRING`, `OTEL_SERVICE_NAME`, `NIMBUS_API_URL` |
| API | `APPLICATIONINSIGHTS_CONNECTION_STRING`, `COSMOS_ENDPOINT` |

## Generate verification traffic

```powershell
$correlationId = [guid]::NewGuid().ToString("N")
$headers = @{ "x-correlation-id" = $correlationId }

Invoke-RestMethod `
  -Uri "https://nimbus-platform-api.azurewebsites.net/api/health" `
  -Headers $headers -ResponseHeadersVariable responseHeaders

if ($responseHeaders["x-correlation-id"] -ne $correlationId) {
  throw "API did not echo the correlation id"
}

Invoke-WebRequest -Uri "https://nimbus-portal.azurewebsites.net/platform" -UseBasicParsing
Write-Output "Search correlation id in App Insights: $correlationId"
```

Visit `/journal` once to exercise the portal -> API -> Cosmos path. Allow several minutes for
ingestion before querying.

## Standard KQL checks

Run these from the `nimbus-insights` Logs blade:

1. [`kql/telemetry-presence.kql`](./kql/telemetry-presence.kql): confirm portal and API roles
   have recent requests, dependencies, and traces.
2. [`kql/service-health.kql`](./kql/service-health.kql): inspect request count, failure rate,
   and p95 latency by role.
3. [`kql/cosmos-dependencies.kql`](./kql/cosmos-dependencies.kql): confirm Cosmos calls appear
   under the API role and inspect latency/failures.
4. [`kql/correlation-trace.kql`](./kql/correlation-trace.kql): replace the correlation id and
   inspect the complete diagnostic timeline.
5. [`kql/recent-errors.kql`](./kql/recent-errors.kql): list failed requests, exceptions, and
   structured `request.error` events.

## Acceptance checklist

- [ ] Portal and API appear as distinct `cloud_RoleName` values.
- [ ] Both roles have recent request telemetry.
- [ ] Portal calls to the API appear as dependencies.
- [ ] API Cosmos dependencies appear with latency and result codes.
- [ ] API responses echo the caller's `x-correlation-id`.
- [ ] The same correlation id retrieves portal and API diagnostic events.
- [ ] Failed requests or synthetic failures enter the error alert evaluation window.
- [ ] No tokens, secrets, prompts, document contents, or personal data appear in telemetry.

## Known limitation

Explicit `x-correlation-id` links portal and API diagnostics, but the Python Functions request
does not yet inherit the portal's W3C operation id. Queue context propagation will be implemented
with the AI worker; see ADR-0010 and the Phase 1 AI resume plan.

Cosmos SDK operations are not currently emitted as dependency spans. Do not mark Cosmos telemetry
verified until `cosmos-dependencies.kql` returns calls from `nimbus-platform-api`.

## Alert deployment

The deployed rules are defined in
[`../../infrastructure/bicep/observability-alerts.bicep`](../../infrastructure/bicep/observability-alerts.bicep):

| Resource | Behavior |
|----------|----------|
| `nimbus-api-health` | Calls `/api/health` every five minutes from three locations |
| `nimbus-api-availability` | Severity 1 when at least two locations fail |
| `nimbus-api-failed-requests` | Severity 2 at five failed requests in five minutes |

Rules evaluate without an Action Group, but nobody is notified. Add an existing Action Group ID
to the Bicep deployment once an email, Teams, or other destination is selected.

## First-response triage

1. Run `service-health.kql` and identify the failing role and time window.
2. Run `recent-errors.kql` for the same window.
3. Copy a correlation id and run `correlation-trace.kql`.
4. If Cosmos is implicated, run `cosmos-dependencies.kql` and check throttling/result codes.
5. If only the portal fails, verify `NIMBUS_API_URL` and OpenTelemetry startup logs.
6. If telemetry is absent, verify setting names, resource linkage, ingestion sampling, and the
   selected Application Insights component before changing application code.