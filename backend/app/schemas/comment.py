import uuid
from datetime import datetime
from pydantic import BaseModel, Field


class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1)
    parent_id: uuid.UUID | None = None
    time_reference: str | None = None


class CommentResponse(BaseModel):
    id: uuid.UUID
    meeting_id: uuid.UUID
    user_id: uuid.UUID
    parent_id: uuid.UUID | None = None
    content: str
    time_reference: str | None = None
    created_at: datetime
    updated_at: datetime
    user_name: str | None = None
    replies: list["CommentResponse"] = []

    model_config = {"from_attributes": True}
