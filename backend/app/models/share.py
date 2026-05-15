import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Share(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "shares"

    meeting_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    shared_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    shared_with: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    permission: Mapped[str] = mapped_column(String(50), default="view", nullable=False)
    share_token: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    meeting = relationship("Meeting", back_populates="shares")
    sharer = relationship("User", back_populates="shares", foreign_keys=[shared_by])

    def __repr__(self):
        return f"<Share meeting={self.meeting_id}>"
