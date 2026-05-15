import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.meeting import MeetingCreate, MeetingUpdate, MeetingResponse, MeetingListResponse
from app.services.meeting_service import MeetingService

router = APIRouter()


@router.get("", response_model=MeetingListResponse)
async def list_meetings(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str | None = None,
    meeting_type: str | None = None,
    search: str | None = None,
    is_archived: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List meetings with pagination and filters."""
    service = MeetingService(db)
    result = await service.list_meetings(
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        status=status,
        meeting_type=meeting_type,
        search=search,
        is_archived=is_archived,
    )
    return result


@router.post("", response_model=MeetingResponse, status_code=201)
async def create_meeting(
    data: MeetingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new meeting."""
    service = MeetingService(db)
    meeting = await service.create_meeting(data, current_user.id)
    return meeting


@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(
    meeting_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get meeting details by ID."""
    service = MeetingService(db)
    meeting = await service.get_meeting(meeting_id, current_user.id)
    return meeting


@router.put("/{meeting_id}", response_model=MeetingResponse)
async def update_meeting(
    meeting_id: uuid.UUID,
    data: MeetingUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a meeting."""
    service = MeetingService(db)
    meeting = await service.update_meeting(meeting_id, data, current_user.id)
    return meeting


@router.delete("/{meeting_id}", status_code=204)
async def delete_meeting(
    meeting_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Soft delete a meeting (archive it)."""
    service = MeetingService(db)
    await service.delete_meeting(meeting_id, current_user.id)
    return None
