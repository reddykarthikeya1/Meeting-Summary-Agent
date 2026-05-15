import uuid
from datetime import datetime, date
from sqlalchemy import String, Text, DateTime, Date, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ActionItem(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "action_items"

    meeting_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    assigned_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[str] = mapped_column(String(20), default="medium", nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    context: Mapped[str | None] = mapped_column(Text, nullable=True)
    time_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relationships
    meeting = relationship("Meeting", back_populates="action_items")
    assignee = relationship("User", back_populates="action_items", foreign_keys=[assigned_to])

    def __repr__(self):
        return f"<ActionItem {self.description[:50]}>"
