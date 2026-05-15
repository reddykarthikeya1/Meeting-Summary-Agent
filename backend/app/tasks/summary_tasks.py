"""Celery tasks for summary generation."""
import uuid
import asyncio
import structlog
from app.tasks.celery_app import celery_app

logger = structlog.get_logger()


def _run_async(coro):
    """Run an async coroutine in a sync context."""
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(name="app.tasks.summary_tasks.generate_summary_task", bind=True, max_retries=3)
def generate_summary_task(
    self,
    meeting_id: str,
    summary_type: str = "brief",
    provider_name: str | None = None,
):
    """Generate a meeting summary in the background.

    Args:
        meeting_id: The meeting UUID as string.
        summary_type: Type of summary to generate.
        provider_name: AI provider to use.
    """
    logger.info("Starting summary task", meeting_id=meeting_id, type=summary_type)

    try:
        result = _run_async(_generate_summary(meeting_id, summary_type, provider_name))
        logger.info("Summary generated", meeting_id=meeting_id)
        return result
    except Exception as exc:
        logger.error("Summary generation failed", meeting_id=meeting_id, error=str(exc))
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


async def _generate_summary(
    meeting_id: str,
    summary_type: str,
    provider_name: str | None,
) -> dict:
    """Async summary generation logic."""
    from sqlalchemy import select
    from app.db.session import async_session_factory
    from app.models.meeting import Meeting
    from app.models.transcript import TranscriptSegment
    from app.models.summary import Summary
    from app.ai.factory import AIProviderFactory
    from app.ai.agents.summarizer import SummarizerAgent

    async with async_session_factory() as session:
        meeting_uuid = uuid.UUID(meeting_id)

        # Get meeting
        meeting_result = await session.execute(
            select(Meeting).where(Meeting.id == meeting_uuid)
        )
        meeting = meeting_result.scalar_one_or_none()
        if not meeting:
            raise ValueError(f"Meeting {meeting_id} not found")

        # Get transcript segments
        segments_result = await session.execute(
            select(TranscriptSegment)
            .where(TranscriptSegment.meeting_id == meeting_uuid)
            .order_by(TranscriptSegment.start_time)
        )
        segments = segments_result.scalars().all()

        if not segments:
            raise ValueError(f"No transcript found for meeting {meeting_id}")

        # Build transcript text
        transcript_text = "\n".join(
            f"[{seg.start_time:.1f}s - {seg.end_time:.1f}s] {seg.text}"
            for seg in segments
        )

        # Get AI provider
        if provider_name:
            provider = AIProviderFactory.create(provider_name)
        else:
            provider = AIProviderFactory.get_default()

        # Build context
        context = {
            "title": meeting.title,
            "date": str(meeting.meeting_date),
            "meeting_type": meeting.meeting_type,
        }

        # Generate summary
        summarizer = SummarizerAgent(provider)
        summary_text = await summarizer.summarize(
            transcript=transcript_text,
            summary_type=summary_type,
            meeting_context=context,
        )

        # Save summary
        summary = Summary(
            id=uuid.uuid4(),
            meeting_id=meeting_uuid,
            summary_type=summary_type,
            content=summary_text,
            ai_provider=provider.get_name(),
            model=provider.default_model if hasattr(provider, "default_model") else None,
        )
        session.add(summary)

        # Update meeting status
        meeting.status = "summarized"
        await session.commit()

        return {
            "meeting_id": meeting_id,
            "summary_id": str(summary.id),
            "summary_type": summary_type,
            "status": "completed",
        }
