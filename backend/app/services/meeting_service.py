"""Meeting management service."""
import uuid
import math
from datetime import datetime
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.meeting import Meeting, MeetingParticipant, Speaker
from app.models.transcript import TranscriptSegment
from app.models.summary import Summary
from app.models.action_item import ActionItem
from app.models.tag import MeetingTag
from app.schemas.meeting import MeetingCreate, MeetingUpdate, MeetingResponse, MeetingListResponse
from app.core.exceptions import NotFoundError, ForbiddenError


class MeetingService:
    """Service for meeting CRUD operations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_meeting(self, data: MeetingCreate, user_id: uuid.UUID) -> MeetingResponse:
        """Create a new meeting with participants and tags."""
        meeting = Meeting(
            id=uuid.uuid4(),
            title=data.title,
            description=data.description,
            meeting_date=data.meeting_date,
            duration_sec=data.duration_sec,
            meeting_type=data.meeting_type,
            created_by=user_id,
            team_id=data.team_id,
            ai_provider=data.ai_provider,
            status="pending",
            is_archived=False,
            metadata_json={},
        )
        self.db.add(meeting)

        # Add participants
        for p in data.participants:
            participant = MeetingParticipant(
                id=uuid.uuid4(),
                meeting_id=meeting.id,
                name=p.name,
                email=p.email,
                role=p.role,
            )
            self.db.add(participant)

        # Add tags
        for tag_id in data.tag_ids:
            mt = MeetingTag(
                id=uuid.uuid4(),
                meeting_id=meeting.id,
                tag_id=tag_id,
            )
            self.db.add(mt)

        await self.db.flush()
        await self.db.refresh(meeting)

        return self._to_response(meeting)

    async def list_meetings(
        self,
        user_id: uuid.UUID,
        page: int = 1,
        page_size: int = 20,
        status: str | None = None,
        meeting_type: str | None = None,
        search: str | None = None,
        is_archived: bool = False,
    ) -> MeetingListResponse:
        """List meetings with pagination and filters."""
        query = select(Meeting).where(
            Meeting.created_by == user_id,
            Meeting.is_archived == is_archived,
        )

        if status:
            query = query.where(Meeting.status == status)
        if meeting_type:
            query = query.where(Meeting.meeting_type == meeting_type)
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Meeting.title.ilike(search_pattern),
                    Meeting.description.ilike(search_pattern),
                )
            )

        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        # Apply pagination
        offset = (page - 1) * page_size
        query = query.order_by(Meeting.meeting_date.desc()).offset(offset).limit(page_size)

        result = await self.db.execute(query)
        meetings = result.scalars().all()

        items = [self._to_response(m) for m in meetings]
        total_pages = math.ceil(total / page_size) if total > 0 else 1

        return MeetingListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    async def get_meeting(self, meeting_id: uuid.UUID, user_id: uuid.UUID) -> MeetingResponse:
        """Get a meeting by ID."""
        result = await self.db.execute(
            select(Meeting).where(Meeting.id == meeting_id)
        )
        meeting = result.scalar_one_or_none()
        if not meeting:
            raise NotFoundError("Meeting", str(meeting_id))
        if meeting.created_by != user_id:
            raise ForbiddenError("You do not have access to this meeting.")
        return self._to_response(meeting)

    async def update_meeting(
        self, meeting_id: uuid.UUID, data: MeetingUpdate, user_id: uuid.UUID
    ) -> MeetingResponse:
        """Update a meeting."""
        result = await self.db.execute(
            select(Meeting).where(Meeting.id == meeting_id)
        )
        meeting = result.scalar_one_or_none()
        if not meeting:
            raise NotFoundError("Meeting", str(meeting_id))
        if meeting.created_by != user_id:
            raise ForbiddenError("You do not have access to this meeting.")

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(meeting, field, value)

        await self.db.flush()
        await self.db.refresh(meeting)
        return self._to_response(meeting)

    async def delete_meeting(self, meeting_id: uuid.UUID, user_id: uuid.UUID) -> None:
        """Soft delete a meeting by archiving it."""
        result = await self.db.execute(
            select(Meeting).where(Meeting.id == meeting_id)
        )
        meeting = result.scalar_one_or_none()
        if not meeting:
            raise NotFoundError("Meeting", str(meeting_id))
        if meeting.created_by != user_id:
            raise ForbiddenError("You do not have access to this meeting.")

        meeting.is_archived = True
        await self.db.flush()

    async def add_participant(
        self, meeting_id: uuid.UUID, participant_data: dict
    ) -> MeetingParticipant:
        """Add a participant to a meeting."""
        result = await self.db.execute(
            select(Meeting).where(Meeting.id == meeting_id)
        )
        meeting = result.scalar_one_or_none()
        if not meeting:
            raise NotFoundError("Meeting", str(meeting_id))

        participant = MeetingParticipant(
            id=uuid.uuid4(),
            meeting_id=meeting_id,
            name=participant_data["name"],
            email=participant_data.get("email"),
            role=participant_data.get("role", "attendee"),
        )
        self.db.add(participant)
        await self.db.flush()
        await self.db.refresh(participant)
        return participant

    def _to_response(self, meeting: Meeting) -> MeetingResponse:
        """Convert a Meeting model to a MeetingResponse schema."""
        return MeetingResponse(
            id=meeting.id,
            title=meeting.title,
            description=meeting.description,
            meeting_date=meeting.meeting_date,
            duration_sec=meeting.duration_sec,
            status=meeting.status,
            meeting_type=meeting.meeting_type,
            created_by=meeting.created_by,
            team_id=meeting.team_id,
            audio_file_url=meeting.audio_file_url,
            ai_provider=meeting.ai_provider,
            metadata=meeting.metadata_json,
            is_archived=meeting.is_archived,
            created_at=meeting.created_at,
            updated_at=meeting.updated_at,
            participant_count=0,
            action_item_count=0,
            has_transcript=bool(meeting.audio_file_url),
            has_summary=False,
        )
