import uuid
from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Comment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "comments"

    meeting_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("comments.id", ondelete="CASCADE"), nullable=True
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    time_reference: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relationships
    meeting = relationship("Meeting", back_populates="comments")
    user = relationship("User", back_populates="comments")
    parent = relationship("Comment", remote_side="Comment.id", backref="replies")

    def __repr__(self):
        return f"<Comment by user={self.user_id}>"
