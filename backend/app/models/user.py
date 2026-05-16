import uuid
from datetime import datetime
from sqlalchemy import String
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    role: Mapped[str] = mapped_column(String(50), default="user", nullable=False)
    preferences: Mapped[dict | None] = mapped_column(JSON, nullable=True, default=dict)

    # Relationships
    meetings = relationship("Meeting", back_populates="creator", foreign_keys="Meeting.created_by")
    comments = relationship("Comment", back_populates="user")
    action_items = relationship("ActionItem", back_populates="assignee", foreign_keys="ActionItem.assigned_to")
    templates = relationship("Template", back_populates="creator", foreign_keys="Template.created_by")
    shares = relationship("Share", back_populates="sharer", foreign_keys="Share.shared_by")

    def __repr__(self):
        return f"<User {self.email}>"
