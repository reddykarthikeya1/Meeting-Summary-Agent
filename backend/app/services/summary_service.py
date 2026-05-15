"""Summary generation service."""
import uuid
import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.meeting import Meeting
from app.models.transcript import TranscriptSegment
from app.models.summary import Summary
from app.schemas.summary import SummaryCreate, SummaryResponse
from app.ai.factory import AIProviderFactory
from app.ai.agents.summarizer import SummarizerAgent
from app.core.exceptions import NotFoundError, ForbiddenError, ValidationError

logger = structlog.get_logger()


class SummaryService:
    """Service for generating and managing meeting summaries."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def generate_summary(
        self, meeting_id: uuid.UUID, data: SummaryCreate, user_id: uuid.UUID
    ) -> SummaryResponse:
        """Generate a meeting summary using AI.

        Args:
            meeting_id: The meeting ID.
            data: Summary creation data.
            user_id: The current user ID.

        Returns:
            The generated summary.

        Raises:
            ValidationError: If no transcript exists.
        """
        meeting = await self._get_meeting(meeting_id, user_id)

        # Fetch transcript segments
        segments_result = await self.db.execute(
            select(TranscriptSegment)
            .where(TranscriptSegment.meeting_id == meeting_id)
            .order_by(TranscriptSegment.start_time)
        )
        segments = segments_result.scalars().all()

        if not segments:
            raise ValidationError("No transcript found for this meeting. Upload and transcribe audio first.")

        # Build transcript text
        transcript_text = "\n".join(
            f"[{seg.start_time:.1f}s - {seg.end_time:.1f}s] {seg.text}"
            for seg in segments
        )

        # Get AI provider
        provider_name = data.ai_provider or meeting.ai_provider or None
        if provider_name:
            provider = AIProviderFactory.create(provider_name)
        else:
            user_prefs = {}
            if hasattr(meeting, "creator") and meeting.creator:
                user_prefs = meeting.creator.preferences or {}
            provider = AIProviderFactory.get_default(user_prefs)

        # Build meeting context
        context = {
            "title": meeting.title,
            "date": str(meeting.meeting_date),
            "meeting_type": meeting.meeting_type,
        }

        # Generate summary
        summarizer = SummarizerAgent(provider)
        summary_text = await summarizer.summarize(
            transcript=transcript_text,
            summary_type=data.summary_type,
            meeting_context=context,
        )

        # Save summary
        summary = Summary(
            id=uuid.uuid4(),
            meeting_id=meeting_id,
            summary_type=data.summary_type,
            content=summary_text,
            ai_provider=provider.get_name(),
            model=provider.default_model if hasattr(provider, "default_model") else None,
            tokens_used=None,
        )
        self.db.add(summary)

        # Update meeting status
        meeting.status = "summarized"
        await self.db.flush()
        await self.db.refresh(summary)

        logger.info("Summary generated", meeting_id=str(meeting_id), type=data.summary_type)

        return SummaryResponse.model_validate(summary)

    async def list_summaries(
        self, meeting_id: uuid.UUID, user_id: uuid.UUID
    ) -> list[SummaryResponse]:
        """List all summaries for a meeting."""
        await self._get_meeting(meeting_id, user_id)

        result = await self.db.execute(
            select(Summary)
            .where(Summary.meeting_id == meeting_id)
            .order_by(Summary.created_at.desc())
        )
        summaries = result.scalars().all()
        return [SummaryResponse.model_validate(s) for s in summaries]

    async def delete_summary(
        self, meeting_id: uuid.UUID, summary_id: uuid.UUID, user_id: uuid.UUID
    ) -> None:
        """Delete a summary."""
        await self._get_meeting(meeting_id, user_id)

        result = await self.db.execute(
            select(Summary).where(
                Summary.id == summary_id,
                Summary.meeting_id == meeting_id,
            )
        )
        summary = result.scalar_one_or_none()
        if not summary:
            raise NotFoundError("Summary", str(summary_id))

        await self.db.delete(summary)
        await self.db.flush()

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
