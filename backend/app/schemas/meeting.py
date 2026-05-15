import uuid
from datetime import datetime
from pydantic import BaseModel, Field


class ParticipantCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: str | None = None
    role: str = "attendee"


class MeetingCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: str | None = None
    meeting_date: datetime
    duration_sec: int | None = None
    meeting_type: str = "general"
    team_id: str | None = None
    ai_provider: str | None = None
    participants: list[ParticipantCreate] = []
    tag_ids: list[uuid.UUID] = []


class MeetingUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=500)
    description: str | None = None
    meeting_date: datetime | None = None
    duration_sec: int | None = None
    status: str | None = None
    meeting_type: str | None = None
    is_archived: bool | None = None
    ai_provider: str | None = None


class MeetingResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: str | None = None
    meeting_date: datetime
    duration_sec: int | None = None
    status: str
    meeting_type: str
    created_by: uuid.UUID
    team_id: str | None = None
    audio_file_url: str | None = None
    ai_provider: str | None = None
    metadata: dict | None = None
    is_archived: bool
    created_at: datetime
    updated_at: datetime
    participant_count: int = 0
    action_item_count: int = 0
    has_transcript: bool = False
    has_summary: bool = False

    model_config = {"from_attributes": True}


class MeetingListResponse(BaseModel):
    items: list[MeetingResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
