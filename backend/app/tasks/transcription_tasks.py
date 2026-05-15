"""Celery tasks for audio transcription."""
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


@celery_app.task(name="app.tasks.transcription_tasks.process_transcription", bind=True, max_retries=3)
def process_transcription(self, meeting_id: str, file_path: str, provider: str = "openai"):
    """Process audio transcription in the background.

    Args:
        meeting_id: The meeting UUID as string.
        file_path: Path to the audio file.
        provider: Transcription provider name.
    """
    logger.info("Starting transcription task", meeting_id=meeting_id, file_path=file_path)

    try:
        result = _run_async(_transcribe_audio(meeting_id, file_path, provider))
        logger.info("Transcription completed", meeting_id=meeting_id, result=result)
        return result
    except Exception as exc:
        logger.error("Transcription failed", meeting_id=meeting_id, error=str(exc))
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


async def _transcribe_audio(meeting_id: str, file_path: str, provider: str) -> dict:
    """Async transcription logic."""
    from sqlalchemy import select
    from app.db.session import async_session_factory
    from app.models.meeting import Meeting
    from app.models.transcript import TranscriptSegment
    from app.audio.transcriber import TranscriberFactory

    transcriber = TranscriberFactory.create(provider)
    result = await transcriber.transcribe(file_path)

    # Save segments to database
    async with async_session_factory() as session:
        meeting_uuid = uuid.UUID(meeting_id)

        for seg in result.segments:
            segment = TranscriptSegment(
                id=uuid.uuid4(),
                meeting_id=meeting_uuid,
                start_time=seg.get("start", 0.0),
                end_time=seg.get("end", 0.0),
                text=seg.get("text", ""),
                confidence=seg.get("confidence"),
                word_count=len(seg.get("text", "").split()),
            )
            session.add(segment)

        # Update meeting status
        meeting_result = await session.execute(
            select(Meeting).where(Meeting.id == meeting_uuid)
        )
        meeting = meeting_result.scalar_one_or_none()
        if meeting:
            meeting.status = "transcribed"

        await session.commit()

    return {
        "meeting_id": meeting_id,
        "status": "transcribed",
        "segment_count": len(result.segments),
        "language": result.language,
        "duration": result.duration,
    }
