import uuid
from sqlalchemy import String, Text, Float, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class TranscriptSegment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "transcript_segments"

    meeting_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    speaker_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("speakers.id", ondelete="SET NULL"), nullable=True
    )
    start_time: Mapped[float] = mapped_column(Float, nullable=False)
    end_time: Mapped[float] = mapped_column(Float, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    word_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    meeting = relationship("Meeting", back_populates="transcript_segments")
    speaker = relationship("Speaker", back_populates="transcript_segments")

    def __repr__(self):
        return f"<TranscriptSegment {self.start_time:.1f}-{self.end_time:.1f}>"
