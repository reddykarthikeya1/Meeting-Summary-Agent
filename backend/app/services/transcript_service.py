"""Transcription service for audio upload and transcription."""
import uuid
import os
import structlog
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import UploadFile
from app.models.meeting import Meeting, Speaker
from app.models.transcript import TranscriptSegment
from app.schemas.transcript import TranscriptResponse, TranscriptSegmentResponse
from app.audio.processor import validate_audio_file, save_audio_file, get_audio_metadata
from app.audio.transcriber import TranscriberFactory
from app.core.exceptions import NotFoundError, ForbiddenError, ValidationError
from app.config import settings

logger = structlog.get_logger()


class TranscriptService:
    """Service for audio upload and transcription management."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def upload_audio(
        self, meeting_id: uuid.UUID, file: UploadFile, user_id: uuid.UUID
    ) -> dict:
        """Upload an audio file for a meeting.

        Args:
            meeting_id: The meeting ID.
            file: The uploaded audio file.
            user_id: The current user ID.

        Returns:
            Dict with file info.
        """
        meeting = await self._get_meeting(meeting_id, user_id)

        # Validate the audio file
        await validate_audio_file(file)

        # Save the file
        file_path = await save_audio_file(
            file=file,
            upload_dir=settings.UPLOAD_DIR,
            meeting_id=str(meeting_id),
        )

        # Get metadata
        metadata = get_audio_metadata(file_path)

        # Update meeting with audio file info
        meeting.audio_file_url = file_path
        if metadata.get("duration_seconds"):
            meeting.duration_sec = int(metadata["duration_seconds"])
        meeting.status = "audio_uploaded"

        if not meeting.metadata_json:
            meeting.metadata_json = {}
        meeting.metadata_json["audio_metadata"] = metadata

        await self.db.flush()

        logger.info("Audio uploaded", meeting_id=str(meeting_id), path=file_path, metadata=metadata)

        return {
            "meeting_id": str(meeting_id),
            "file_path": file_path,
            "metadata": metadata,
            "status": "audio_uploaded",
        }

    async def start_transcription(
        self, meeting_id: uuid.UUID, user_id: uuid.UUID, provider: str = "openai"
    ) -> dict:
        """Start transcription for a meeting's audio.

        Args:
            meeting_id: The meeting ID.
            user_id: The current user ID.
            provider: Transcription provider name.

        Returns:
            Dict with job status.
        """
        meeting = await self._get_meeting(meeting_id, user_id)

        if not meeting.audio_file_url:
            raise ValidationError("No audio file uploaded for this meeting.")

        if not os.path.exists(meeting.audio_file_url):
            raise ValidationError("Audio file not found on disk.")

        # Try to queue via Celery; fall back to direct processing
        try:
            from app.tasks.transcription_tasks import process_transcription

            task = process_transcription.delay(str(meeting_id), meeting.audio_file_url)
            meeting.status = "transcribing"
            await self.db.flush()

            logger.info("Transcription queued", meeting_id=str(meeting_id), task_id=task.id)
            return {
                "meeting_id": str(meeting_id),
                "status": "transcribing",
                "task_id": task.id,
            }
        except Exception as e:
            logger.warning("Celery unavailable, processing directly", error=str(e))
            return await self._transcribe_direct(meeting, provider)

    async def _transcribe_direct(self, meeting: Meeting, provider: str) -> dict:
        """Transcribe audio directly (fallback when Celery is unavailable)."""
        transcriber = TranscriberFactory.create(provider)
        result = await transcriber.transcribe(meeting.audio_file_url)

        # Save transcript segments
        for seg in result.segments:
            segment = TranscriptSegment(
                id=uuid.uuid4(),
                meeting_id=meeting.id,
                start_time=seg.get("start", 0.0),
                end_time=seg.get("end", 0.0),
                text=seg.get("text", ""),
                confidence=seg.get("confidence"),
                word_count=len(seg.get("text", "").split()),
            )
            self.db.add(segment)

        meeting.status = "transcribed"
        await self.db.flush()

        return {
            "meeting_id": str(meeting.id),
            "status": "transcribed",
            "segment_count": len(result.segments),
            "language": result.language,
            "duration": result.duration,
        }

    async def get_transcript(
        self, meeting_id: uuid.UUID, user_id: uuid.UUID
    ) -> TranscriptResponse:
        """Get the transcript for a meeting."""
        await self._get_meeting(meeting_id, user_id)

        result = await self.db.execute(
            select(TranscriptSegment)
            .where(TranscriptSegment.meeting_id == meeting_id)
            .order_by(TranscriptSegment.start_time)
        )
        segments = result.scalars().all()

        # Get speakers for this meeting
        speakers_result = await self.db.execute(
            select(Speaker).where(Speaker.meeting_id == meeting_id)
        )
        speakers = speakers_result.scalars().all()

        segment_responses = [
            TranscriptSegmentResponse.model_validate(seg) for seg in segments
        ]

        total_duration = 0.0
        if segments:
            total_duration = max(s.end_time for s in segments)

        return TranscriptResponse(
            meeting_id=meeting_id,
            segments=segment_responses,
            total_segments=len(segments),
            total_duration=total_duration,
            speakers=[
                {
                    "id": str(s.id),
                    "name": s.name,
                    "total_speaking_time": s.total_speaking_time,
                    "segment_count": s.segment_count,
                }
                for s in speakers
            ],
        )

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
