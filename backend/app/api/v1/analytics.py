from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.analytics import AnalyticsOverview, MeetingStats, SpeakerStats
from app.services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/overview", response_model=AnalyticsOverview)
async def get_analytics_overview(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get analytics overview for the dashboard."""
    service = AnalyticsService(db)
    overview = await service.get_overview(current_user.id)
    return overview


@router.get("/meetings", response_model=MeetingStats)
async def get_meeting_stats(
    days: int = Query(30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get meeting statistics for a time period."""
    service = AnalyticsService(db)
    stats = await service.get_meeting_stats(current_user.id, days=days)
    return stats


@router.get("/speakers", response_model=list[SpeakerStats])
async def get_speaker_stats(
    meeting_id: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get speaker statistics."""
    service = AnalyticsService(db)
    stats = await service.get_speaker_stats(current_user.id, meeting_id=meeting_id)
    return stats
