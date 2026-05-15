from pydantic import BaseModel, Field


class SearchQuery(BaseModel):
    q: str = Field(..., min_length=1, max_length=500)
    meeting_type: str | None = None
    date_from: str | None = None
    date_to: str | None = None
    page: int = 1
    page_size: int = 20


class SearchResultItem(BaseModel):
    meeting_id: str
    meeting_title: str
    match_type: str  # "title", "transcript", "summary", "action_item"
    match_text: str
    relevance_score: float
    meeting_date: str


class SearchResult(BaseModel):
    items: list[SearchResultItem]
    total: int
    query: str
    page: int
    page_size: int
