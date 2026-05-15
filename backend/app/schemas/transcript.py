import uuid
from datetime import datetime
from pydantic import BaseModel


class TranscriptSegmentResponse(BaseModel):
    id: uuid.UUID
    meeting_id: uuid.UUID
    speaker_id: uuid.UUID | None = None
    start_time: float
    end_time: float
    text: str
    confidence: float | None = None
    word_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class TranscriptResponse(BaseModel):
    meeting_id: uuid.UUID
    segments: list[TranscriptSegmentResponse]
    total_segments: int
    total_duration: float
    speakers: list[dict] = []
