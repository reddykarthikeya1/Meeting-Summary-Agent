import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.action_item import (
    ActionItemCreate,
    ActionItemUpdate,
    ActionItemStatusUpdate,
    ActionItemResponse,
)
from app.services.action_item_service import ActionItemService

router = APIRouter()


@router.get("/action-items", response_model=list[ActionItemResponse])
async def list_all_action_items(
    status: str | None = None,
    priority: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all action items assigned to the current user."""
    service = ActionItemService(db)
    items = await service.list_user_action_items(
        user_id=current_user.id, status=status, priority=priority, page=page, page_size=page_size
    )
    return items


@router.post("/meetings/{meeting_id}/action-items", response_model=ActionItemResponse, status_code=201)
async def create_action_item(
    meeting_id: uuid.UUID,
    data: ActionItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new action item for a meeting."""
    service = ActionItemService(db)
    item = await service.create_action_item(meeting_id, data, current_user.id)
    return item


@router.put("/action-items/{item_id}", response_model=ActionItemResponse)
async def update_action_item(
    item_id: uuid.UUID,
    data: ActionItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an action item."""
    service = ActionItemService(db)
    item = await service.update_action_item(item_id, data, current_user.id)
    return item


@router.patch("/action-items/{item_id}/status", response_model=ActionItemResponse)
async def update_action_item_status(
    item_id: uuid.UUID,
    data: ActionItemStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the status of an action item."""
    service = ActionItemService(db)
    item = await service.update_status(item_id, data.status, current_user.id)
    return item


@router.delete("/action-items/{item_id}", status_code=204)
async def delete_action_item(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an action item."""
    service = ActionItemService(db)
    await service.delete_action_item(item_id, current_user.id)
    return None


@router.post("/meetings/{meeting_id}/action-items/extract", response_model=list[ActionItemResponse])
async def extract_action_items(
    meeting_id: uuid.UUID,
    provider: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Use AI to extract action items from meeting transcript."""
    service = ActionItemService(db)
    items = await service.extract_action_items(meeting_id, current_user.id, provider)
    return items
