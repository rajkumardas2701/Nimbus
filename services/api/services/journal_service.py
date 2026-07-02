"""Journal business logic. Thin: assigns identity + timestamp, delegates persistence."""

from datetime import datetime, timezone
from uuid import uuid4

from models import JournalEntryCreate
from repositories.journal_repository import JournalRepository


class JournalService:
    def __init__(self, repo: JournalRepository) -> None:
        self._repo = repo

    def list_entries(self) -> list[dict]:
        return self._repo.list_entries()

    def create_entry(self, data: JournalEntryCreate) -> dict:
        entry = {
            "id": uuid4().hex,
            "title": data.title,
            "body": data.body,
            "tags": data.tags,
            "date": data.date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        }
        return self._repo.create_entry(entry)
