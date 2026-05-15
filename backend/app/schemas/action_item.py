import uuid
from datetime import datetime, date
from pydantic import BaseModel, Field


class ActionItemCreate(BaseModel):
    assigned_to: uuid.UUID | None = None
    assigned_name: str | None = None
    description: str = Field(..., min_length=1)
    priority: str = "medium"
    due_date: date | None = None
    context: str | None = None
    time_reference: str | None = None


class ActionItemUpdate(BaseModel):
    assigned_to: uuid.UUID | None = None
    assigned_name: str | None = None
    description: str | None = Field(None, min_length=1)
    priority: str | None = None
    status: str | None = None
    due_date: date | None = None
    context: str | None = None


class ActionItemStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(pending|in_progress|completed|cancelled)$")


class ActionItemResponse(BaseModel):
    id: uuid.UUID
    meeting_id: uuid.UUID
    assigned_to: uuid.UUID | None = None
    assigned_name: str | None = None
    description: str
    priority: str
    status: str
    due_date: date | None = None
    completed_at: datetime | None = None
    context: str | None = None
    time_reference: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
