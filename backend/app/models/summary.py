import uuid
from sqlalchemy import String, Text, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Summary(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "summaries"

    meeting_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    summary_type: Mapped[str] = mapped_column(String(50), default="general", nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    ai_provider: Mapped[str | None] = mapped_column(String(50), nullable=True)
    model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    tokens_used: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Relationships
    meeting = relationship("Meeting", back_populates="summaries")

    def __repr__(self):
        return f"<Summary type={self.summary_type}>"
