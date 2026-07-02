"""Boundary models. All input is validated here before it reaches the service layer."""

from pydantic import BaseModel, Field


class JournalEntryCreate(BaseModel):
    """Payload accepted by POST /api/journal."""

    title: str = Field(min_length=1, max_length=200)
    body: str = Field(min_length=1, max_length=5000)
    tags: list[str] = Field(default_factory=list)
    # Optional ISO date (YYYY-MM-DD). Defaults to today when omitted.
    date: str | None = Field(default=None)


class JournalEntry(BaseModel):
    """A stored journal entry as returned to clients."""

    id: str
    title: str
    body: str
    tags: list[str]
    date: str
