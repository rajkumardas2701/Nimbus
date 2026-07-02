"""Data access for journal entries. The only layer that talks to Cosmos."""

from azure.cosmos import CosmosClient

from config import COSMOS_DATABASE, COSMOS_JOURNAL_CONTAINER


class JournalRepository:
    def __init__(self, client: CosmosClient) -> None:
        self._container = client.get_database_client(
            COSMOS_DATABASE
        ).get_container_client(COSMOS_JOURNAL_CONTAINER)

    def list_entries(self) -> list[dict]:
        query = (
            "SELECT c.id, c.title, c.body, c.tags, c.date "
            "FROM c ORDER BY c.date DESC"
        )
        return list(
            self._container.query_items(
                query=query, enable_cross_partition_query=True
            )
        )

    def create_entry(self, entry: dict) -> dict:
        return self._container.create_item(body=entry)
