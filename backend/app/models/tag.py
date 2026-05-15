import uuid
from sqlalchemy import String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Tag(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "tags"

    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    color: Mapped[str | None] = mapped_column(String(7), nullable=True)

    # Relationships
    meetings = relationship("MeetingTag", back_populates="tag", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Tag {self.name}>"


class MeetingTag(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "meeting_tags"

    meeting_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    tag_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tags.id", ondelete="CASCADE"), nullable=False, index=True
    )

    # Relationships
    meeting = relationship("Meeting", back_populates="tags")
    tag = relationship("Tag", back_populates="meetings")

    def __repr__(self):
        return f"<MeetingTag meeting={self.meeting_id} tag={self.tag_id}>"
