import uuid
from datetime import datetime
from pydantic import BaseModel, Field


class TemplateCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    category: str = "general"
    structure: dict = {}
    is_default: bool = False


class TemplateResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None = None
    category: str
    structure: dict
    is_default: bool
    is_system: bool
    created_by: uuid.UUID | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
