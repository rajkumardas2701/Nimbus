"""Client factories. A single Cosmos client is shared per worker process.

Keyless: DefaultAzureCredential resolves to the Azure CLI login locally and to a
managed identity in Azure. No connection strings, no keys.
"""

from functools import lru_cache

from azure.cosmos import CosmosClient
from azure.identity import DefaultAzureCredential

from config import COSMOS_ENDPOINT


@lru_cache(maxsize=1)
def get_cosmos_client() -> CosmosClient:
    if not COSMOS_ENDPOINT:
        raise RuntimeError("COSMOS_ENDPOINT is not configured.")
    return CosmosClient(COSMOS_ENDPOINT, credential=DefaultAzureCredential())
