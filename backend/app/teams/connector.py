"""
Microsoft Graph API connector for Teams integration.
Handles authentication and API calls to Microsoft Graph.
"""
import httpx
from typing import Optional
from datetime import datetime, timedelta, timezone
from app.config import settings
from app.teams.models import TeamsMeeting, TeamsChannelMessage


class GraphAPIConnector:
    """Connector for Microsoft Graph API."""

    BASE_URL = "https://graph.microsoft.com/v1.0"

    def __init__(self, tenant_id: str, client_id: str, client_secret: str):
        self.tenant_id = tenant_id
        self.client_id = client_id
        self.client_secret = client_secret
        self._access_token: Optional[str] = None
        self._token_expires: Optional[datetime] = None

    async def _get_access_token(self) -> str:
        """Get OAuth2 access token for Graph API."""
        if self._access_token and self._token_expires and datetime.now(timezone.utc) < self._token_expires:
            return self._access_token

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://login.microsoftonline.com/{self.tenant_id}/oauth2/v2.0/token",
                data={
                    "grant_type": "client_credentials",
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "scope": "https://graph.microsoft.com/.default",
                },
            )
            response.raise_for_status()
            data = response.json()
            self._access_token = data["access_token"]
            self._token_expires = datetime.now(timezone.utc) + timedelta(seconds=data["expires_in"] - 300)
            return self._access_token

    async def _request(self, method: str, path: str, **kwargs) -> dict:
        """Make authenticated request to Graph API."""
        token = await self._get_access_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method, f"{self.BASE_URL}{path}", headers=headers, **kwargs
            )
            response.raise_for_status()
            return response.json()

    # --- Calendar & Meetings ---

    async def get_user_meetings(
        self, user_id: str, start: datetime, end: datetime
    ) -> list[TeamsMeeting]:
        """Get calendar events (meetings) for a user."""
        data = await self._request(
            "GET",
            f"/users/{user_id}/calendarView",
            params={
                "startDateTime": start.isoformat(),
                "endDateTime": end.isoformat(),
                "$orderby": "start/dateTime",
            },
        )
        meetings = []
        for event in data.get("value", []):
            meetings.append(
                TeamsMeeting(
                    id=event["id"],
                    subject=event.get("subject", "Untitled"),
                    start_datetime=datetime.fromisoformat(event["start"]["dateTime"]),
                    end_datetime=datetime.fromisoformat(event["end"]["dateTime"]) if event.get("end") else None,
                    organizer=event.get("organizer", {}).get("emailAddress", {}).get("name", "Unknown"),
                    participants=[
                        a.get("emailAddress", {}).get("name", "")
                        for a in event.get("attendees", [])
                    ],
                )
            )
        return meetings

    async def get_online_meeting(self, user_id: str, meeting_id: str) -> dict:
        """Get online meeting details including recording and transcript."""
        return await self._request(
            "GET",
            f"/users/{user_id}/onlineMeetings/{meeting_id}",
        )

    async def get_meeting_transcript(self, user_id: str, meeting_id: str) -> str:
        """Get meeting transcript content."""
        data = await self._request(
            "GET",
            f"/users/{user_id}/onlineMeetings/{meeting_id}/transcripts",
        )
        transcripts = data.get("value", [])
        if not transcripts:
            return ""

        # Get the latest transcript content
        transcript_id = transcripts[0]["id"]
        content = await self._request(
            "GET",
            f"/users/{user_id}/onlineMeetings/{meeting_id}/transcripts/{transcript_id}/content",
        )
        return content.get("content", "")

    async def get_meeting_recording(self, user_id: str, meeting_id: str) -> Optional[str]:
        """Get meeting recording URL."""
        data = await self._request(
            "GET",
            f"/users/{user_id}/onlineMeetings/{meeting_id}/recordings",
        )
        recordings = data.get("value", [])
        if recordings:
            return recordings[0].get("contentCorrelationId")
        return None

    # --- Channel Messages ---

    async def get_channel_messages(
        self, team_id: str, channel_id: str, limit: int = 50
    ) -> list[TeamsChannelMessage]:
        """Get recent messages from a channel."""
        data = await self._request(
            "GET",
            f"/teams/{team_id}/channels/{channel_id}/messages",
            params={"$top": limit},
        )
        messages = []
        for msg in data.get("value", []):
            messages.append(
                TeamsChannelMessage(
                    id=msg["id"],
                    channel_id=channel_id,
                    team_id=team_id,
                    sender=msg.get("from", {}).get("user", {}).get("displayName", "Unknown"),
                    content=msg.get("body", {}).get("content", ""),
                    created_at=datetime.fromisoformat(msg["createdDateTime"]),
                    meeting_id=msg.get("meeting", {}).get("id"),
                )
            )
        return messages

    async def send_channel_message(
        self, team_id: str, channel_id: str, content: str
    ) -> dict:
        """Send a message to a Teams channel."""
        return await self._request(
            "POST",
            f"/teams/{team_id}/channels/{channel_id}/messages",
            json={"body": {"content": content, "contentType": "html"}},
        )

    # --- Chat Messages ---

    async def send_chat_message(self, chat_id: str, content: str) -> dict:
        """Send a message to a Teams chat."""
        return await self._request(
            "POST",
            f"/chats/{chat_id}/messages",
            json={"body": {"content": content, "contentType": "html"}},
        )

    # --- Meeting Notes ---

    async def create_meeting_notes(
        self, user_id: str, meeting_id: str, notes_html: str
    ) -> dict:
        """Create or update meeting notes in Teams."""
        return await self._request(
            "POST",
            f"/users/{user_id}/onlineMeetings/{meeting_id}/meetingNotes",
            json={"content": notes_html},
        )
