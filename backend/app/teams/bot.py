"""Teams bot handler for meeting notes and commands."""
import structlog
from datetime import datetime, timezone
from app.teams.connector import GraphAPIConnector

logger = structlog.get_logger()


class TeamsBotHandler:
    """Handles Teams bot commands and meeting events."""

    def __init__(self, graph_connector: GraphAPIConnector):
        self.connector = graph_connector
        self._active_notes: dict[str, list[str]] = {}  # chat_id -> list of notes
        self._meeting_sessions: dict[str, dict] = {}  # meeting_id -> session data

    async def handle_message(self, activity: dict) -> dict:
        """Handle an incoming message activity from Teams.

        Args:
            activity: The Teams activity object.

        Returns:
            Response object for Teams.
        """
        text = activity.get("text", "").strip()
        chat_id = activity.get("conversation", {}).get("id", "")
        from_user = activity.get("from", {})
        user_id = from_user.get("id", "")
        user_name = from_user.get("name", "Unknown")

        # Remove bot mention if present
        if text.startswith("<at>"):
            # Remove the <at>...</at> mention tag
            end_idx = text.find("</at>")
            if end_idx != -1:
                text = text[end_idx + 5:].strip()

        # Parse command
        command, params = self._parse_command(text)

        logger.info("Bot command received", command=command, user=user_name, chat_id=chat_id)

        handlers = {
            "/startnotes": self._handle_start_notes,
            "/stopnotes": self._handle_stop_notes,
            "/summarize": self._handle_summarize,
            "/actionitems": self._handle_action_items,
            "/help": self._handle_help,
            "/link": self._handle_link,
            "/status": self._handle_status,
        }

        handler = handlers.get(command)
        if handler:
            response_text = await handler(
                chat_id=chat_id,
                user_id=user_id,
                user_name=user_name,
                params=params,
                activity=activity,
            )
        else:
            # If no command matched, check if we're in an active notes session
            if chat_id in self._active_notes:
                self._active_notes[chat_id].append(f"[{user_name}] {text}")
                return {"type": "message", "text": "Note captured."}
            else:
                response_text = (
                    "I didn't understand that command. Type **/help** to see available commands."
                )

        return self._create_message_response(response_text, chat_id)

    async def handle_meeting_event(self, activity: dict) -> dict:
        """Handle meeting start/end events.

        Args:
            activity: The Teams event activity.

        Returns:
            Acknowledgment response.
        """
        event_type = activity.get("type", "")
        meeting_id = activity.get("meeting", {}).get("id", "")
        chat_id = activity.get("conversation", {}).get("id", "")

        if "Started" in event_type:
            logger.info("Meeting started", meeting_id=meeting_id)
            self._meeting_sessions[meeting_id] = {
                "started_at": datetime.now(timezone.utc).isoformat(),
                "chat_id": chat_id,
                "notes": [],
            }

            # Notify the chat that note-taking is available
            if chat_id:
                await self.connector.send_chat_message(
                    chat_id,
                    "<b>Meeting started!</b> Type <b>/startnotes</b> to begin capturing notes, "
                    "or <b>/help</b> for all available commands.",
                )

        elif "Ended" in event_type:
            logger.info("Meeting ended", meeting_id=meeting_id)
            session = self._meeting_sessions.pop(meeting_id, {})

            # Auto-stop notes if active
            if chat_id in self._active_notes:
                notes = self._active_notes.pop(chat_id)
                session["notes"] = notes

                # Save notes summary
                if notes and chat_id:
                    notes_html = "<br>".join(notes)
                    await self.connector.send_chat_message(
                        chat_id,
                        f"<b>Meeting ended. Notes captured ({len(notes)} entries):</b><br>{notes_html}",
                    )

        return {"status": "acknowledged"}

    async def _handle_start_notes(
        self, chat_id: str, user_id: str, user_name: str, **kwargs
    ) -> str:
        """Start capturing meeting notes."""
        if chat_id in self._active_notes:
            return "Notes are already being captured for this meeting."

        self._active_notes[chat_id] = []
        return (
            f"Note-taking started by {user_name}. "
            "All messages will be captured as meeting notes. "
            "Type **/stopnotes** when done."
        )

    async def _handle_stop_notes(
        self, chat_id: str, user_id: str, user_name: str, **kwargs
    ) -> str:
        """Stop capturing notes and save them."""
        if chat_id not in self._active_notes:
            return "No active note-taking session. Type **/startnotes** to begin."

        notes = self._active_notes.pop(chat_id)
        if not notes:
            return "No notes were captured."

        # Format and send notes
        notes_html = "<br>".join(f"  {i+1}. {n}" for i, n in enumerate(notes))

        return (
            f"<b>Notes saved ({len(notes)} entries):</b><br>{notes_html}"
        )

    async def _handle_summarize(
        self, chat_id: str, user_id: str, user_name: str, **kwargs
    ) -> str:
        """Generate a summary of captured notes."""
        notes = self._active_notes.get(chat_id, [])

        if not notes:
            return (
                "No notes to summarize. Start capturing notes with **/startnotes** first, "
                "or use the web app to generate AI summaries from transcripts."
            )

        # Simple bullet-point summary of captured notes
        summary_lines = ["<b>Meeting Notes Summary:</b>", ""]
        for i, note in enumerate(notes, 1):
            summary_lines.append(f"{i}. {note}")

        summary_lines.append("")
        summary_lines.append(
            "For AI-powered summaries, upload the meeting recording to the MeetAI web app."
        )

        return "<br>".join(summary_lines)

    async def _handle_action_items(
        self, chat_id: str, user_id: str, user_name: str, **kwargs
    ) -> str:
        """Show or add action items."""
        params = kwargs.get("params", "")

        if params:
            # Add a new action item note
            if chat_id in self._active_notes:
                self._active_notes[chat_id].append(f"[ACTION] {params}")
                return f"Action item added: {params}"
            else:
                return "Start notes first with **/startnotes** to add action items."

        return (
            "To add an action item, type: **/actionitems [description]**<br>"
            "For AI-extracted action items from transcripts, use the MeetAI web app."
        )

    async def _handle_help(self, **kwargs) -> str:
        """Show help message."""
        return (
            "<b>MeetAI Bot Commands:</b><br><br>"
            "  <b>/startnotes</b> - Start capturing meeting notes<br>"
            "  <b>/stopnotes</b> - Stop capturing and save notes<br>"
            "  <b>/summarize</b> - Generate a summary of captured notes<br>"
            "  <b>/actionitems [task]</b> - Add an action item<br>"
            "  <b>/link</b> - Get the link to the MeetAI web app<br>"
            "  <b>/status</b> - Check current note-taking status<br>"
            "  <b>/help</b> - Show this help message<br><br>"
            "During a meeting, just type messages and they will be captured as notes "
            "when note-taking is active."
        )

    async def _handle_link(self, **kwargs) -> str:
        """Get the web app link."""
        return "Access the MeetAI web app at: http://localhost:3000"

    async def _handle_status(self, chat_id: str, **kwargs) -> str:
        """Check current status."""
        if chat_id in self._active_notes:
            count = len(self._active_notes[chat_id])
            return f"Note-taking is **active**. {count} notes captured so far."
        return "No active note-taking session. Type **/startnotes** to begin."

    @staticmethod
    def _parse_command(text: str) -> tuple[str, str]:
        """Parse a command and its parameters from message text.

        Returns:
            Tuple of (command, parameters).
        """
        if not text:
            return "", ""

        parts = text.split(None, 1)
        command = parts[0].lower()
        params = parts[1] if len(parts) > 1 else ""

        return command, params

    @staticmethod
    def _create_message_response(text: str, chat_id: str) -> dict:
        """Create a Teams message response."""
        return {
            "type": "message",
            "text": text,
            "textFormat": "xml",
        }
