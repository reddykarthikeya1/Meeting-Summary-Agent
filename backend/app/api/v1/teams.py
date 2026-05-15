"""
Teams webhook and integration API endpoints.
"""
from fastapi import APIRouter, Request, HTTPException, Depends
from typing import Optional
from datetime import datetime, timedelta
from app.config import settings
from app.teams.connector import GraphAPIConnector
from app.teams.bot import TeamsBotHandler

router = APIRouter(prefix="/teams", tags=["teams"])

# Initialize connector (in production, use env vars)
graph_connector = None
bot_handler = None


def get_graph_connector() -> GraphAPIConnector:
    """Get or create Graph API connector."""
    global graph_connector
    if not graph_connector:
        graph_connector = GraphAPIConnector(
            tenant_id=settings.TEAMS_TENANT_ID,
            client_id=settings.TEAMS_CLIENT_ID,
            client_secret=settings.TEAMS_CLIENT_SECRET,
        )
    return graph_connector


def get_bot_handler() -> TeamsBotHandler:
    """Get or create bot handler."""
    global bot_handler
    if not bot_handler:
        bot_handler = TeamsBotHandler(
            graph_connector=get_graph_connector(),
        )
    return bot_handler


@router.post("/webhook")
async def teams_webhook(request: Request):
    """
    Handle incoming Teams bot messages and events.
    This is the main webhook endpoint that Teams sends activities to.
    """
    body = await request.json()

    # Verify the request is from Teams (in production, validate JWT)
    activity_type = body.get("type")

    if activity_type == "message":
        handler = get_bot_handler()
        return await handler.handle_message(body)

    elif activity_type in [
        "MicrosoftGraph.OnlineMeetingStarted",
        "MicrosoftGraph.OnlineMeetingEnded",
    ]:
        handler = get_bot_handler()
        return await handler.handle_meeting_event(body)

    # For other activity types (conversationUpdate, etc.)
    return {"status": "ok"}


@router.get("/webhook")
async def webhook_validation(request: Request):
    """
    Handle Teams bot validation challenge.
    Teams sends a validation request when the bot is first registered.
    """
    # Teams sends a validationToken query parameter
    validation_token = request.query_params.get("validationToken")
    if validation_token:
        from fastapi.responses import PlainTextResponse
        return PlainTextResponse(content=validation_token, status_code=200)
    return {"status": "ok"}


@router.post("/connect")
async def connect_teams_account(
    tenant_id: str,
    client_id: str,
    client_secret: str,
):
    """
    Connect a Microsoft Teams account by providing Azure AD credentials.
    Stores the credentials and initializes the Graph API connector.
    """
    global graph_connector, bot_handler

    # Validate credentials by trying to get an access token
    connector = GraphAPIConnector(tenant_id, client_id, client_secret)
    try:
        await connector._get_access_token()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid credentials: {str(e)}")

    graph_connector = connector
    bot_handler = TeamsBotHandler(graph_connector=connector)

    return {
        "status": "connected",
        "tenant_id": tenant_id,
        "message": "Teams account connected successfully. Bot is ready to receive events.",
    }


@router.get("/meetings")
async def list_teams_meetings(
    user_id: str,
    days: int = 7,
):
    """
    List recent Teams meetings for a user.
    Requires a connected Teams account.
    """
    connector = get_graph_connector()
    if not connector:
        raise HTTPException(status_code=400, detail="Teams account not connected. Call /teams/connect first.")

    start = datetime.utcnow() - timedelta(days=days)
    end = datetime.utcnow()

    try:
        meetings = await connector.get_user_meetings(user_id, start, end)
        return {"meetings": [m.model_dump() for m in meetings]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch meetings: {str(e)}")


@router.get("/meetings/{meeting_id}/transcript")
async def get_teams_meeting_transcript(user_id: str, meeting_id: str):
    """
    Get transcript for a specific Teams meeting.
    """
    connector = get_graph_connector()
    if not connector:
        raise HTTPException(status_code=400, detail="Teams account not connected.")

    try:
        transcript = await connector.get_meeting_transcript(user_id, meeting_id)
        return {"meeting_id": meeting_id, "transcript": transcript}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch transcript: {str(e)}")


@router.post("/sync")
async def sync_teams_meeting(
    user_id: str,
    meeting_id: str,
):
    """
    Sync a Teams meeting to MeetAI.
    Fetches transcript, recording, and metadata from Teams and creates a meeting in MeetAI.
    """
    connector = get_graph_connector()
    if not connector:
        raise HTTPException(status_code=400, detail="Teams account not connected.")

    try:
        # Get meeting details
        meeting_data = await connector.get_online_meeting(user_id, meeting_id)

        # Get transcript
        transcript = await connector.get_meeting_transcript(user_id, meeting_id)

        # Get recording URL
        recording_url = await connector.get_meeting_recording(user_id, meeting_id)

        return {
            "status": "synced",
            "meeting_id": meeting_id,
            "subject": meeting_data.get("subject", "Untitled"),
            "has_transcript": bool(transcript),
            "has_recording": bool(recording_url),
            "transcript_length": len(transcript) if transcript else 0,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to sync meeting: {str(e)}")


@router.post("/send-message")
async def send_teams_message(
    chat_id: str,
    content: str,
):
    """Send a message to a Teams chat or channel."""
    connector = get_graph_connector()
    if not connector:
        raise HTTPException(status_code=400, detail="Teams account not connected.")

    try:
        result = await connector.send_chat_message(chat_id, content)
        return {"status": "sent", "message_id": result.get("id")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")
