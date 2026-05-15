import uuid
from sqlalchemy import String, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Template(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "templates"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str] = mapped_column(String(100), default="general", nullable=False)
    structure: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    # Relationships
    creator = relationship("User", back_populates="templates", foreign_keys=[created_by])

    def __repr__(self):
        return f"<Template {self.name}>"
