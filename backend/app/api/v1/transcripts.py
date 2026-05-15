import uuid
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.transcript import TranscriptResponse
from app.services.transcript_service import TranscriptService

router = APIRouter()


@router.post("/{meeting_id}/upload", status_code=201)
async def upload_audio(
    meeting_id: uuid.UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload an audio file for a meeting."""
    service = TranscriptService(db)
    result = await service.upload_audio(meeting_id, file, current_user.id)
    return result


@router.post("/{meeting_id}/transcribe", status_code=202)
async def start_transcription(
    meeting_id: uuid.UUID,
    provider: str = "openai",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Start transcription for a meeting's audio file."""
    service = TranscriptService(db)
    result = await service.start_transcription(meeting_id, current_user.id, provider)
    return result


@router.get("/{meeting_id}/transcript", response_model=TranscriptResponse)
async def get_transcript(
    meeting_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get the transcript for a meeting."""
    service = TranscriptService(db)
    result = await service.get_transcript(meeting_id, current_user.id)
    return result
