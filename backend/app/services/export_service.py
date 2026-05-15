"""Export service for generating meeting reports."""
import uuid
import io
import json
import structlog
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.meeting import Meeting, MeetingParticipant
from app.models.transcript import TranscriptSegment
from app.models.summary import Summary
from app.models.action_item import ActionItem
from app.models.comment import Comment
from app.core.exceptions import NotFoundError, ForbiddenError, ValidationError

logger = structlog.get_logger()


class ExportService:
    """Service for exporting meeting data in various formats."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def export_meeting(
        self, meeting_id: uuid.UUID, user_id: uuid.UUID, format: str = "pdf"
    ) -> dict:
        """Export a meeting in the specified format.

        Args:
            meeting_id: The meeting ID.
            user_id: Current user ID.
            format: Export format - "pdf", "markdown", or "json".

        Returns:
            Dict with content, media_type, and filename.
        """
        meeting = await self._get_meeting(meeting_id, user_id)

        # Gather all meeting data
        data = await self._gather_meeting_data(meeting)

        if format == "json":
            return self._export_json(meeting, data)
        elif format == "markdown":
            return self._export_markdown(meeting, data)
        elif format == "pdf":
            return self._export_pdf(meeting, data)
        else:
            raise ValidationError(f"Unsupported export format: {format}")

    async def _gather_meeting_data(self, meeting: Meeting) -> dict:
        """Gather all related data for a meeting."""
        # Participants
        participants_result = await self.db.execute(
            select(MeetingParticipant).where(MeetingParticipant.meeting_id == meeting.id)
        )
        participants = participants_result.scalars().all()

        # Transcript
        transcript_result = await self.db.execute(
            select(TranscriptSegment)
            .where(TranscriptSegment.meeting_id == meeting.id)
            .order_by(TranscriptSegment.start_time)
        )
        segments = transcript_result.scalars().all()

        # Summaries
        summary_result = await self.db.execute(
            select(Summary)
            .where(Summary.meeting_id == meeting.id)
            .order_by(Summary.created_at.desc())
        )
        summaries = summary_result.scalars().all()

        # Action items
        action_result = await self.db.execute(
            select(ActionItem)
            .where(ActionItem.meeting_id == meeting.id)
            .order_by(ActionItem.priority, ActionItem.created_at)
        )
        action_items = action_result.scalars().all()

        # Comments
        comment_result = await self.db.execute(
            select(Comment)
            .where(Comment.meeting_id == meeting.id, Comment.parent_id.is_(None))
            .order_by(Comment.created_at)
        )
        comments = comment_result.scalars().all()

        return {
            "participants": participants,
            "segments": segments,
            "summaries": summaries,
            "action_items": action_items,
            "comments": comments,
        }

    def _export_json(self, meeting: Meeting, data: dict) -> dict:
        """Export meeting as JSON."""
        export_data = {
            "meeting": {
                "id": str(meeting.id),
                "title": meeting.title,
                "description": meeting.description,
                "date": str(meeting.meeting_date),
                "duration_seconds": meeting.duration_sec,
                "status": meeting.status,
                "type": meeting.meeting_type,
            },
            "participants": [
                {"name": p.name, "email": p.email, "role": p.role}
                for p in data["participants"]
            ],
            "transcript": [
                {
                    "start": seg.start_time,
                    "end": seg.end_time,
                    "text": seg.text,
                    "confidence": seg.confidence,
                }
                for seg in data["segments"]
            ],
            "summaries": [
                {
                    "type": s.summary_type,
                    "content": s.content,
                    "provider": s.ai_provider,
                    "created_at": str(s.created_at),
                }
                for s in data["summaries"]
            ],
            "action_items": [
                {
                    "description": item.description,
                    "assigned_to": item.assigned_name,
                    "priority": item.priority,
                    "status": item.status,
                    "due_date": str(item.due_date) if item.due_date else None,
                }
                for item in data["action_items"]
            ],
            "comments": [
                {
                    "content": c.content,
                    "time_reference": c.time_reference,
                    "created_at": str(c.created_at),
                }
                for c in data["comments"]
            ],
        }

        content = json.dumps(export_data, indent=2, default=str)
        return {
            "content": content,
            "media_type": "application/json",
            "filename": f"{meeting.title.replace(' ', '_')}.json",
        }

    def _export_markdown(self, meeting: Meeting, data: dict) -> dict:
        """Export meeting as Markdown."""
        lines = []
        lines.append(f"# {meeting.title}\n")
        lines.append(f"**Date:** {meeting.meeting_date.strftime('%Y-%m-%d %H:%M')}")
        if meeting.duration_sec:
            mins = meeting.duration_sec // 60
            lines.append(f"**Duration:** {mins} minutes")
        lines.append(f"**Status:** {meeting.status}")
        lines.append(f"**Type:** {meeting.meeting_type}")
        if meeting.description:
            lines.append(f"\n{meeting.description}\n")

        # Participants
        if data["participants"]:
            lines.append("\n## Participants\n")
            for p in data["participants"]:
                lines.append(f"- {p.name}" + (f" ({p.email})" if p.email else "") + f" - {p.role}")

        # Summaries
        if data["summaries"]:
            lines.append("\n## Summary\n")
            for s in data["summaries"]:
                lines.append(f"### {s.summary_type.title()} Summary\n")
                lines.append(s.content)
                lines.append("")

        # Action Items
        if data["action_items"]:
            lines.append("\n## Action Items\n")
            for item in data["action_items"]:
                status_icon = "[x]" if item.status == "completed" else "[ ]"
                assignee = f" (@{item.assigned_name})" if item.assigned_name else ""
                due = f" - Due: {item.due_date}" if item.due_date else ""
                lines.append(f"- {status_icon} **[{item.priority.upper()}]** {item.description}{assignee}{due}")

        # Transcript
        if data["segments"]:
            lines.append("\n## Transcript\n")
            for seg in data["segments"]:
                timestamp = f"[{self._format_time(seg.start_time)}]"
                lines.append(f"**{timestamp}** {seg.text}\n")

        content = "\n".join(lines)
        return {
            "content": content.encode("utf-8"),
            "media_type": "text/markdown",
            "filename": f"{meeting.title.replace(' ', '_')}.md",
        }

    def _export_pdf(self, meeting: Meeting, data: dict) -> dict:
        """Export meeting as PDF using reportlab."""
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib import colors

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5 * inch)
        styles = getSampleStyleSheet()
        story = []

        # Title
        title_style = ParagraphStyle(
            "CustomTitle", parent=styles["Title"], fontSize=18, spaceAfter=12
        )
        story.append(Paragraph(meeting.title, title_style))

        # Meeting info
        info_style = styles["Normal"]
        info_lines = [
            f"Date: {meeting.meeting_date.strftime('%Y-%m-%d %H:%M')}",
            f"Status: {meeting.status}",
            f"Type: {meeting.meeting_type}",
        ]
        if meeting.duration_sec:
            info_lines.insert(1, f"Duration: {meeting.duration_sec // 60} minutes")
        for line in info_lines:
            story.append(Paragraph(line, info_style))
        story.append(Spacer(1, 12))

        if meeting.description:
            story.append(Paragraph(meeting.description, styles["Normal"]))
            story.append(Spacer(1, 12))

        # Participants
        if data["participants"]:
            story.append(Paragraph("Participants", styles["Heading2"]))
            for p in data["participants"]:
                story.append(Paragraph(f"  {p.name} - {p.role}", styles["Normal"]))
            story.append(Spacer(1, 12))

        # Summaries
        if data["summaries"]:
            story.append(Paragraph("Summary", styles["Heading2"]))
            for s in data["summaries"]:
                story.append(Paragraph(f"<b>{s.summary_type.title()}</b>", styles["Normal"]))
                # Split content into paragraphs
                for para in s.content.split("\n"):
                    if para.strip():
                        story.append(Paragraph(para.strip(), styles["Normal"]))
            story.append(Spacer(1, 12))

        # Action Items
        if data["action_items"]:
            story.append(Paragraph("Action Items", styles["Heading2"]))
            table_data = [["Priority", "Description", "Assigned To", "Status"]]
            for item in data["action_items"]:
                table_data.append([
                    item.priority.upper(),
                    item.description[:80],
                    item.assigned_name or "Unassigned",
                    item.status,
                ])
            table = Table(table_data, colWidths=[1 * inch, 3 * inch, 1.5 * inch, 1 * inch])
            table.setStyle(
                TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                    ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                    ("FONTSIZE", (0, 0), (-1, 0), 10),
                    ("FONTSIZE", (0, 1), (-1, -1), 9),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
                    ("GRID", (0, 0), (-1, -1), 1, colors.black),
                ])
            )
            story.append(table)
            story.append(Spacer(1, 12))

        # Transcript
        if data["segments"]:
            story.append(Paragraph("Transcript", styles["Heading2"]))
            for seg in data["segments"]:
                timestamp = self._format_time(seg.start_time)
                story.append(
                    Paragraph(
                        f"<b>[{timestamp}]</b> {seg.text}",
                        styles["Normal"],
                    )
                )

        doc.build(story)
        pdf_content = buffer.getvalue()
        buffer.close()

        return {
            "content": pdf_content,
            "media_type": "application/pdf",
            "filename": f"{meeting.title.replace(' ', '_')}.pdf",
        }

    async def _get_meeting(self, meeting_id: uuid.UUID, user_id: uuid.UUID) -> Meeting:
        """Fetch and validate meeting ownership."""
        result = await self.db.execute(
            select(Meeting).where(Meeting.id == meeting_id)
        )
        meeting = result.scalar_one_or_none()
        if not meeting:
            raise NotFoundError("Meeting", str(meeting_id))
        if meeting.created_by != user_id:
            raise ForbiddenError("You do not have access to this meeting.")
        return meeting

    @staticmethod
    def _format_time(seconds: float) -> str:
        """Format seconds into HH:MM:SS."""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        if hours > 0:
            return f"{hours:02d}:{minutes:02d}:{secs:02d}"
        return f"{minutes:02d}:{secs:02d}"
