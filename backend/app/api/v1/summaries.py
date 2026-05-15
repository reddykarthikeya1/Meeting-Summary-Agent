import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.summary import SummaryCreate, SummaryResponse
from app.services.summary_service import SummaryService

router = APIRouter()


@router.post("/{meeting_id}/summaries", response_model=SummaryResponse, status_code=201)
async def generate_summary(
    meeting_id: uuid.UUID,
    data: SummaryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate a new summary for a meeting using AI."""
    service = SummaryService(db)
    summary = await service.generate_summary(meeting_id, data, current_user.id)
    return summary


@router.get("/{meeting_id}/summaries", response_model=list[SummaryResponse])
async def list_summaries(
    meeting_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all summaries for a meeting."""
    service = SummaryService(db)
    summaries = await service.list_summaries(meeting_id, current_user.id)
    return summaries


@router.delete("/{meeting_id}/summaries/{summary_id}", status_code=204)
async def delete_summary(
    meeting_id: uuid.UUID,
    summary_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a summary."""
    service = SummaryService(db)
    await service.delete_summary(meeting_id, summary_id, current_user.id)
    return None
