"""Teams-specific data models."""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TeamsMeeting(BaseModel):
    """Meeting data from Microsoft Teams."""
    id: str
    subject: str
    start_datetime: datetime
    end_datetime: Optional[datetime] = None
    organizer: str
    participants: list[str] = []
    chat_id: Optional[str] = None
    channel_id: Optional[str] = None
    recording_url: Optional[str] = None
    transcript_url: Optional[str] = None


class TeamsChannelMessage(BaseModel):
    """Message from a Teams channel."""
    id: str
    channel_id: str
    team_id: str
    sender: str
    content: str
    created_at: datetime
    meeting_id: Optional[str] = None


class TeamsChatMessage(BaseModel):
    """Message from a Teams chat."""
    id: str
    chat_id: str
    sender: str
    content: str
    created_at: datetime


class TeamsBotCommand(BaseModel):
    """Command received by the Teams bot."""
    command: str
    meeting_id: Optional[str] = None
    channel_id: Optional[str] = None
    user_id: str
    user_name: str
    parameters: dict = {}
