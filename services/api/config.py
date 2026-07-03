"""Static config + environment-derived settings. Handlers stay declarative."""

import os

SERVICE_NAME = "nimbus-api"
VERSION = "0.1.1"

# Cosmos DB — keyless (AAD) access via DefaultAzureCredential.
COSMOS_ENDPOINT = os.environ.get("COSMOS_ENDPOINT", "")
COSMOS_DATABASE = os.environ.get("COSMOS_DATABASE", "nimbus")
COSMOS_JOURNAL_CONTAINER = os.environ.get("COSMOS_JOURNAL_CONTAINER", "journal")
