"""Action item management service."""
import uuid
import math
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.meeting import Meeting, MeetingParticipant
from app.models.transcript import TranscriptSegment
from app.models.action_item import ActionItem
from app.schemas.action_item import ActionItemCreate, ActionItemUpdate, ActionItemResponse
from app.ai.factory import AIProviderFactory
from app.ai.agents.action_extractor import ActionExtractorAgent
from app.core.exceptions import NotFoundError, ForbiddenError, ValidationError

import structlog

logger = structlog.get_logger()


class ActionItemService:
    """Service for managing action items."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_action_item(
        self, meeting_id: uuid.UUID, data: ActionItemCreate, user_id: uuid.UUID
    ) -> ActionItemResponse:
        """Create a new action item for a meeting."""
        await self._get_meeting(meeting_id, user_id)

        item = ActionItem(
            id=uuid.uuid4(),
            meeting_id=meeting_id,
            assigned_to=data.assigned_to,
            assigned_name=data.assigned_name,
            description=data.description,
            priority=data.priority,
            status="pending",
            due_date=data.due_date,
            context=data.context,
            time_reference=data.time_reference,
        )
        self.db.add(item)
        await self.db.flush()
        await self.db.refresh(item)

        return ActionItemResponse.model_validate(item)

    async def list_user_action_items(
        self,
        user_id: uuid.UUID,
        status: str | None = None,
        priority: str | None = None,
        page: int = 1,
        page_size: int = 50,
    ) -> list[ActionItemResponse]:
        """List all action items assigned to a user."""
        query = select(ActionItem).where(ActionItem.assigned_to == user_id)

        if status:
            query = query.where(ActionItem.status == status)
        if priority:
            query = query.where(ActionItem.priority == priority)

        offset = (page - 1) * page_size
        query = query.order_by(ActionItem.created_at.desc()).offset(offset).limit(page_size)

        result = await self.db.execute(query)
        items = result.scalars().all()
        return [ActionItemResponse.model_validate(item) for item in items]

    async def update_action_item(
        self, item_id: uuid.UUID, data: ActionItemUpdate, user_id: uuid.UUID
    ) -> ActionItemResponse:
        """Update an action item."""
        item = await self._get_item(item_id, user_id)

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(item, field, value)

        await self.db.flush()
        await self.db.refresh(item)
        return ActionItemResponse.model_validate(item)

    async def update_status(
        self, item_id: uuid.UUID, status: str, user_id: uuid.UUID
    ) -> ActionItemResponse:
        """Update the status of an action item."""
        item = await self._get_item(item_id, user_id)

        item.status = status
        if status == "completed":
            item.completed_at = datetime.now(timezone.utc)

        await self.db.flush()
        await self.db.refresh(item)
        return ActionItemResponse.model_validate(item)

    async def delete_action_item(self, item_id: uuid.UUID, user_id: uuid.UUID) -> None:
        """Delete an action item."""
        item = await self._get_item(item_id, user_id)
        await self.db.delete(item)
        await self.db.flush()

    async def extract_action_items(
        self, meeting_id: uuid.UUID, user_id: uuid.UUID, provider_name: str | None = None
    ) -> list[ActionItemResponse]:
        """Use AI to extract action items from meeting transcript."""
        meeting = await self._get_meeting(meeting_id, user_id)

        # Fetch transcript
        segments_result = await self.db.execute(
            select(TranscriptSegment)
            .where(TranscriptSegment.meeting_id == meeting_id)
            .order_by(TranscriptSegment.start_time)
        )
        segments = segments_result.scalars().all()

        if not segments:
            raise ValidationError("No transcript found for this meeting.")

        transcript_text = "\n".join(
            f"[{seg.start_time:.1f}s - {seg.end_time:.1f}s] {seg.text}"
            for seg in segments
        )

        # Get participant names
        participants_result = await self.db.execute(
            select(MeetingParticipant).where(MeetingParticipant.meeting_id == meeting_id)
        )
        participants = participants_result.scalars().all()
        participant_names = [p.name for p in participants]

        # Get AI provider
        if provider_name:
            provider = AIProviderFactory.create(provider_name)
        else:
            provider = AIProviderFactory.get_default()

        # Extract action items
        extractor = ActionExtractorAgent(provider)
        extracted = await extractor.extract(
            transcript=transcript_text,
            participants=participant_names,
        )

        # Save extracted items
        created_items = []
        for item_data in extracted:
            # Try to match assigned_to to a participant
            assigned_to = None
            assigned_name = item_data.get("assigned_to")
            if assigned_name:
                for p in participants:
                    if p.name.lower() == assigned_name.lower():
                        assigned_to = p.user_id
                        break

            item = ActionItem(
                id=uuid.uuid4(),
                meeting_id=meeting_id,
                assigned_to=assigned_to,
                assigned_name=assigned_name,
                description=item_data["description"],
                priority=item_data.get("priority", "medium"),
                status="pending",
                due_date=item_data.get("due_date"),
                context="AI-extracted from meeting transcript",
            )
            self.db.add(item)
            created_items.append(item)

        await self.db.flush()

        for item in created_items:
            await self.db.refresh(item)

        logger.info(
            "Action items extracted",
            meeting_id=str(meeting_id),
            count=len(created_items),
        )

        return [ActionItemResponse.model_validate(item) for item in created_items]

    async def _get_meeting(self, meeting_id: uuid.UUID, user_id: uuid.UUID) -> Meeting:
        """Fetch and validate meeting ownership."""
        result = await self.db.execute(
            select(Meeting).where(Meeting.id == meeting_id)
        )
        meeting = result.scalar_one_or_none()
        if not meeting:
            raise NotFoundError("Meeting", str(meeting_id))
        if meeting.created_by != user_id:
            raise ForbiddenError("You do not have access to this meeting.")
        return meeting

    async def _get_item(self, item_id: uuid.UUID, user_id: uuid.UUID) -> ActionItem:
        """Fetch an action item and validate access."""
        result = await self.db.execute(
            select(ActionItem).where(ActionItem.id == item_id)
        )
        item = result.scalar_one_or_none()
        if not item:
            raise NotFoundError("ActionItem", str(item_id))

        # Verify the user has access to the meeting
        await self._get_meeting(item.meeting_id, user_id)
        return item
