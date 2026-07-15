targetScope = 'resourceGroup'

@description('Name of the existing workspace-based Application Insights component.')
param applicationInsightsName string = 'nimbus-insights'

@description('Public endpoint used by the standard availability test.')
param healthEndpoint string = 'https://nimbus-platform-api.azurewebsites.net/api/health'

@description('Azure region used to store the global web test resource.')
param webTestLocation string = 'centralindia'

@description('Optional existing Action Group resource ID. Leave empty to create alerts without notifications.')
param actionGroupResourceId string = ''

@description('Failed request count that triggers the error alert within a five-minute window.')
@minValue(1)
param failedRequestThreshold int = 5

var availabilityTestName = 'nimbus-api-health'
var actionGroupActions = empty(actionGroupResourceId)
  ? []
  : [
      {
        actionGroupId: actionGroupResourceId
      }
    ]

resource applicationInsights 'Microsoft.Insights/components@2020-02-02' existing = {
  name: applicationInsightsName
}

resource availabilityTest 'Microsoft.Insights/webtests@2022-06-15' = {
  name: availabilityTestName
  location: webTestLocation
  tags: {
    'hidden-link:${applicationInsights.id}': 'Resource'
  }
  kind: 'standard'
  properties: {
    SyntheticMonitorId: availabilityTestName
    Name: 'Nimbus Platform API health'
    Description: 'Checks the production Platform API health contract every five minutes.'
    Enabled: true
    Frequency: 300
    Timeout: 30
    Kind: 'standard'
    RetryEnabled: true
    Locations: [
      {
        Id: 'apac-sg-sin-azr'
      }
      {
        Id: 'emea-nl-ams-azr'
      }
      {
        Id: 'us-ca-sjc-azr'
      }
    ]
    Request: {
      RequestUrl: healthEndpoint
      HttpVerb: 'GET'
      ParseDependentRequests: false
      FollowRedirects: true
    }
    ValidationRules: {
      ExpectedHttpStatusCode: 200
      SSLCheck: true
      SSLCertRemainingLifetimeCheck: 7
    }
  }
}

resource availabilityAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: 'nimbus-api-availability'
  location: 'global'
  properties: {
    description: 'Nimbus Platform API health failed from at least two test locations.'
    severity: 1
    enabled: true
    scopes: [
      applicationInsights.id
      availabilityTest.id
    ]
    evaluationFrequency: 'PT1M'
    windowSize: 'PT5M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.WebtestLocationAvailabilityCriteria'
      componentId: applicationInsights.id
      webTestId: availabilityTest.id
      failedLocationCount: 2
    }
    autoMitigate: true
    actions: actionGroupActions
  }
}

resource failedRequestAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: 'nimbus-api-failed-requests'
  location: 'global'
  properties: {
    description: 'Nimbus telemetry recorded multiple failed requests within five minutes.'
    severity: 2
    enabled: true
    scopes: [
      applicationInsights.id
    ]
    evaluationFrequency: 'PT1M'
    windowSize: 'PT5M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'FailedRequests'
          metricNamespace: 'microsoft.insights/components'
          metricName: 'requests/failed'
          operator: 'GreaterThanOrEqual'
          threshold: failedRequestThreshold
          timeAggregation: 'Count'
          criterionType: 'StaticThresholdCriterion'
          skipMetricValidation: false
        }
      ]
    }
    autoMitigate: true
    actions: actionGroupActions
  }
}

output availabilityTestId string = availabilityTest.id
output availabilityAlertId string = availabilityAlert.id
output failedRequestAlertId string = failedRequestAlert.id