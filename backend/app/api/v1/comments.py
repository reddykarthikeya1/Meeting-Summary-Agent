import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentResponse
from app.services.comment_service import CommentService

router = APIRouter()


@router.get("/meetings/{meeting_id}/comments", response_model=list[CommentResponse])
async def list_comments(
    meeting_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all comments for a meeting."""
    service = CommentService(db)
    comments = await service.list_comments(meeting_id, current_user.id)
    return comments


@router.post("/meetings/{meeting_id}/comments", response_model=CommentResponse, status_code=201)
async def create_comment(
    meeting_id: uuid.UUID,
    data: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a comment on a meeting."""
    service = CommentService(db)
    comment = await service.create_comment(meeting_id, data, current_user.id)
    return comment


@router.put("/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: uuid.UUID,
    data: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a comment."""
    service = CommentService(db)
    comment = await service.update_comment(comment_id, data, current_user.id)
    return comment


@router.delete("/comments/{comment_id}", status_code=204)
async def delete_comment(
    comment_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a comment."""
    service = CommentService(db)
    await service.delete_comment(comment_id, current_user.id)
    return None
