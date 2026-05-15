from pydantic import BaseModel


class MeetingStats(BaseModel):
    total_meetings: int = 0
    total_duration_hours: float = 0.0
    avg_duration_minutes: float = 0.0
    meetings_this_week: int = 0
    meetings_this_month: int = 0
    action_items_total: int = 0
    action_items_completed: int = 0
    action_items_pending: int = 0
    top_meeting_types: list[dict] = []
    meetings_by_status: dict = {}


class SpeakerStats(BaseModel):
    speaker_id: str
    speaker_name: str
    total_speaking_time: float
    segment_count: int
    avg_segment_length: float
    meetings_count: int


class AnalyticsOverview(BaseModel):
    meeting_stats: MeetingStats
    recent_speakers: list[SpeakerStats] = []
    activity_trend: list[dict] = []
