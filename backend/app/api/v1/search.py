from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.search import SearchResult
from app.services.search_service import SearchService

router = APIRouter()


@router.get("", response_model=SearchResult)
async def search(
    q: str = Query(..., min_length=1, max_length=500),
    meeting_type: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Search meetings, transcripts, summaries, and action items."""
    service = SearchService(db)
    result = await service.search(
        query=q,
        user_id=current_user.id,
        meeting_type=meeting_type,
        date_from=date_from,
        date_to=date_to,
        page=page,
        page_size=page_size,
    )
    return result
