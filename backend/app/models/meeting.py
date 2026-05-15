import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, Integer, Boolean, Float, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Meeting(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "meetings"

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    meeting_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    duration_sec: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)
    meeting_type: Mapped[str] = mapped_column(String(50), default="general", nullable=False)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    team_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    audio_file_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    ai_provider: Mapped[str | None] = mapped_column(String(50), nullable=True)
    metadata_json: Mapped[dict | None] = mapped_column("metadata", JSON, nullable=True, default=dict)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    creator = relationship("User", back_populates="meetings", foreign_keys=[created_by])
    participants = relationship("MeetingParticipant", back_populates="meeting", cascade="all, delete-orphan")
    speakers = relationship("Speaker", back_populates="meeting", cascade="all, delete-orphan")
    transcript_segments = relationship("TranscriptSegment", back_populates="meeting", cascade="all, delete-orphan")
    summaries = relationship("Summary", back_populates="meeting", cascade="all, delete-orphan")
    action_items = relationship("ActionItem", back_populates="meeting", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="meeting", cascade="all, delete-orphan")
    tags = relationship("MeetingTag", back_populates="meeting", cascade="all, delete-orphan")
    shares = relationship("Share", back_populates="meeting", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Meeting {self.title}>"


class MeetingParticipant(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "meeting_participants"

    meeting_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(50), default="attendee", nullable=False)

    # Relationships
    meeting = relationship("Meeting", back_populates="participants")

    def __repr__(self):
        return f"<MeetingParticipant {self.name}>"


class Speaker(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "speakers"

    meeting_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    label: Mapped[str | None] = mapped_column(String(100), nullable=True)
    total_speaking_time: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    segment_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    meeting = relationship("Meeting", back_populates="speakers")
    transcript_segments = relationship("TranscriptSegment", back_populates="speaker")

    def __repr__(self):
        return f"<Speaker {self.name}>"
