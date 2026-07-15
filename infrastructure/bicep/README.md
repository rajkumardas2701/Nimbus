# infrastructure/bicep

Azure infrastructure as code (Bicep). Portal + API + Cosmos land here in Phase 0's deploy step.

## Observability alerts

`observability-alerts.bicep` adds:

- A standard availability test for the production Platform API `/api/health` endpoint.
- A severity-1 alert when at least two test locations fail.
- A severity-2 alert when Application Insights records five or more failed requests in five
	minutes.

Validate before deployment:

```powershell
az bicep build --file infrastructure/bicep/observability-alerts.bicep
az deployment group validate `
	--resource-group nimbus-rg `
	--template-file infrastructure/bicep/observability-alerts.bicep
```

To send notifications, pass an existing Action Group resource ID:

```powershell
az deployment group create `
	--resource-group nimbus-rg `
	--template-file infrastructure/bicep/observability-alerts.bicep `
	--parameters actionGroupResourceId="<ACTION_GROUP_RESOURCE_ID>"
```

Leaving `actionGroupResourceId` empty creates the tests and alert rules without notification
actions. Do not deploy until the correct personal Azure subscription is selected.
