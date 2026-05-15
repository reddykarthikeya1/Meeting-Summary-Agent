import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.template import TemplateCreate, TemplateResponse
from app.services.template_service import TemplateService

router = APIRouter()


@router.get("", response_model=list[TemplateResponse])
async def list_templates(
    category: str | None = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all available templates."""
    service = TemplateService(db)
    templates = await service.list_templates(category=category)
    return templates


@router.post("", response_model=TemplateResponse, status_code=201)
async def create_template(
    data: TemplateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new template."""
    service = TemplateService(db)
    template = await service.create_template(data, current_user.id)
    return template


@router.get("/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a template by ID."""
    service = TemplateService(db)
    template = await service.get_template(template_id)
    return template


@router.put("/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: uuid.UUID,
    data: TemplateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a template."""
    service = TemplateService(db)
    template = await service.update_template(template_id, data, current_user.id)
    return template


@router.delete("/{template_id}", status_code=204)
async def delete_template(
    template_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a template."""
    service = TemplateService(db)
    await service.delete_template(template_id, current_user.id)
    return None
