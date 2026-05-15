"""Comment service for meeting comments."""
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.meeting import Meeting
from app.models.comment import Comment
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentResponse
from app.core.exceptions import NotFoundError, ForbiddenError


class CommentService:
    """Service for managing meeting comments."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_comments(
        self, meeting_id: uuid.UUID, user_id: uuid.UUID
    ) -> list[CommentResponse]:
        """List all top-level comments for a meeting with replies."""
        await self._get_meeting(meeting_id, user_id)

        result = await self.db.execute(
            select(Comment, User.name)
            .join(User, Comment.user_id == User.id)
            .where(Comment.meeting_id == meeting_id, Comment.parent_id.is_(None))
            .order_by(Comment.created_at)
        )
        rows = result.all()

        comments = []
        for comment, user_name in rows:
            # Get replies
            replies_result = await self.db.execute(
                select(Comment, User.name)
                .join(User, Comment.user_id == User.id)
                .where(Comment.parent_id == comment.id)
                .order_by(Comment.created_at)
            )
            replies = [
                CommentResponse(
                    id=r.id,
                    meeting_id=r.meeting_id,
                    user_id=r.user_id,
                    parent_id=r.parent_id,
                    content=r.content,
                    time_reference=r.time_reference,
                    created_at=r.created_at,
                    updated_at=r.updated_at,
                    user_name=name,
                    replies=[],
                )
                for r, name in replies_result.all()
            ]

            comments.append(
                CommentResponse(
                    id=comment.id,
                    meeting_id=comment.meeting_id,
                    user_id=comment.user_id,
                    parent_id=comment.parent_id,
                    content=comment.content,
                    time_reference=comment.time_reference,
                    created_at=comment.created_at,
                    updated_at=comment.updated_at,
                    user_name=user_name,
                    replies=replies,
                )
            )

        return comments

    async def create_comment(
        self, meeting_id: uuid.UUID, data: CommentCreate, user_id: uuid.UUID
    ) -> CommentResponse:
        """Create a comment on a meeting."""
        await self._get_meeting(meeting_id, user_id)

        comment = Comment(
            id=uuid.uuid4(),
            meeting_id=meeting_id,
            user_id=user_id,
            parent_id=data.parent_id,
            content=data.content,
            time_reference=data.time_reference,
        )
        self.db.add(comment)
        await self.db.flush()
        await self.db.refresh(comment)

        # Get user name
        user_result = await self.db.execute(select(User.name).where(User.id == user_id))
        user_name = user_result.scalar_one_or_none()

        return CommentResponse(
            id=comment.id,
            meeting_id=comment.meeting_id,
            user_id=comment.user_id,
            parent_id=comment.parent_id,
            content=comment.content,
            time_reference=comment.time_reference,
            created_at=comment.created_at,
            updated_at=comment.updated_at,
            user_name=user_name,
            replies=[],
        )

    async def update_comment(
        self, comment_id: uuid.UUID, data: CommentCreate, user_id: uuid.UUID
    ) -> CommentResponse:
        """Update a comment."""
        result = await self.db.execute(
            select(Comment).where(Comment.id == comment_id)
        )
        comment = result.scalar_one_or_none()
        if not comment:
            raise NotFoundError("Comment", str(comment_id))
        if comment.user_id != user_id:
            raise ForbiddenError("You can only edit your own comments.")

        comment.content = data.content
        comment.time_reference = data.time_reference
        await self.db.flush()
        await self.db.refresh(comment)

        user_result = await self.db.execute(select(User.name).where(User.id == user_id))
        user_name = user_result.scalar_one_or_none()

        return CommentResponse(
            id=comment.id,
            meeting_id=comment.meeting_id,
            user_id=comment.user_id,
            parent_id=comment.parent_id,
            content=comment.content,
            time_reference=comment.time_reference,
            created_at=comment.created_at,
            updated_at=comment.updated_at,
            user_name=user_name,
            replies=[],
        )

    async def delete_comment(self, comment_id: uuid.UUID, user_id: uuid.UUID) -> None:
        """Delete a comment."""
        result = await self.db.execute(
            select(Comment).where(Comment.id == comment_id)
        )
        comment = result.scalar_one_or_none()
        if not comment:
            raise NotFoundError("Comment", str(comment_id))
        if comment.user_id != user_id:
            raise ForbiddenError("You can only delete your own comments.")

        await self.db.delete(comment)
        await self.db.flush()

    async def _get_meeting(self, meeting_id: uuid.UUID, user_id: uuid.UUID) -> Meeting:
        """Fetch and validate meeting access."""
        result = await self.db.execute(
            select(Meeting).where(Meeting.id == meeting_id)
        )
        meeting = result.scalar_one_or_none()
        if not meeting:
            raise NotFoundError("Meeting", str(meeting_id))
        if meeting.created_by != user_id:
            raise ForbiddenError("You do not have access to this meeting.")
        return meeting
