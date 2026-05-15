"""Template service for meeting templates."""
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.template import Template
from app.schemas.template import TemplateCreate, TemplateResponse
from app.core.exceptions import NotFoundError, ForbiddenError


class TemplateService:
    """Service for managing meeting templates."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_templates(self, category: str | None = None) -> list[TemplateResponse]:
        """List all available templates."""
        query = select(Template)
        if category:
            query = query.where(Template.category == category)
        query = query.order_by(Template.is_default.desc(), Template.name)

        result = await self.db.execute(query)
        templates = result.scalars().all()
        return [TemplateResponse.model_validate(t) for t in templates]

    async def create_template(
        self, data: TemplateCreate, user_id: uuid.UUID
    ) -> TemplateResponse:
        """Create a new template."""
        template = Template(
            id=uuid.uuid4(),
            name=data.name,
            description=data.description,
            category=data.category,
            structure=data.structure,
            is_default=data.is_default,
            is_system=False,
            created_by=user_id,
        )
        self.db.add(template)
        await self.db.flush()
        await self.db.refresh(template)
        return TemplateResponse.model_validate(template)

    async def get_template(self, template_id: uuid.UUID) -> TemplateResponse:
        """Get a template by ID."""
        result = await self.db.execute(
            select(Template).where(Template.id == template_id)
        )
        template = result.scalar_one_or_none()
        if not template:
            raise NotFoundError("Template", str(template_id))
        return TemplateResponse.model_validate(template)

    async def update_template(
        self, template_id: uuid.UUID, data: TemplateCreate, user_id: uuid.UUID
    ) -> TemplateResponse:
        """Update a template."""
        result = await self.db.execute(
            select(Template).where(Template.id == template_id)
        )
        template = result.scalar_one_or_none()
        if not template:
            raise NotFoundError("Template", str(template_id))
        if template.is_system:
            raise ForbiddenError("System templates cannot be modified.")
        if template.created_by and template.created_by != user_id:
            raise ForbiddenError("You can only edit your own templates.")

        template.name = data.name
        template.description = data.description
        template.category = data.category
        template.structure = data.structure
        template.is_default = data.is_default

        await self.db.flush()
        await self.db.refresh(template)
        return TemplateResponse.model_validate(template)

    async def delete_template(self, template_id: uuid.UUID, user_id: uuid.UUID) -> None:
        """Delete a template."""
        result = await self.db.execute(
            select(Template).where(Template.id == template_id)
        )
        template = result.scalar_one_or_none()
        if not template:
            raise NotFoundError("Template", str(template_id))
        if template.is_system:
            raise ForbiddenError("System templates cannot be deleted.")
        if template.created_by and template.created_by != user_id:
            raise ForbiddenError("You can only delete your own templates.")

        await self.db.delete(template)
        await self.db.flush()
