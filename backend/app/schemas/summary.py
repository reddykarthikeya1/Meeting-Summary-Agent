import uuid
from datetime import datetime
from pydantic import BaseModel, Field


class SummaryCreate(BaseModel):
    summary_type: str = "general"
    ai_provider: str | None = None
    model: str | None = None


class SummaryResponse(BaseModel):
    id: uuid.UUID
    meeting_id: uuid.UUID
    summary_type: str
    content: str
    ai_provider: str | None = None
    model: str | None = None
    tokens_used: int | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
