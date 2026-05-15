"""Analytics service for meeting statistics."""
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy import select, func, and_, case
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.meeting import Meeting, Speaker
from app.models.action_item import ActionItem
from app.schemas.analytics import MeetingStats, SpeakerStats, AnalyticsOverview


class AnalyticsService:
    """Service for generating meeting analytics and statistics."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_overview(self, user_id: uuid.UUID) -> AnalyticsOverview:
        """Get analytics overview for the dashboard."""
        meeting_stats = await self.get_meeting_stats(user_id, days=30)
        speaker_stats = await self.get_speaker_stats(user_id)
        activity_trend = await self._get_activity_trend(user_id, days=30)

        return AnalyticsOverview(
            meeting_stats=meeting_stats,
            recent_speakers=speaker_stats[:10],
            activity_trend=activity_trend,
        )

    async def get_meeting_stats(self, user_id: uuid.UUID, days: int = 30) -> MeetingStats:
        """Get meeting statistics for a time period."""
        now = datetime.now(timezone.utc)
        start_date = now - timedelta(days=days)

        # Total meetings
        total_result = await self.db.execute(
            select(func.count(Meeting.id)).where(
                Meeting.created_by == user_id,
                Meeting.is_archived == False,
            )
        )
        total_meetings = total_result.scalar() or 0

        # Total and average duration
        duration_result = await self.db.execute(
            select(
                func.coalesce(func.sum(Meeting.duration_sec), 0),
                func.coalesce(func.avg(Meeting.duration_sec), 0),
            ).where(
                Meeting.created_by == user_id,
                Meeting.is_archived == False,
                Meeting.duration_sec.isnot(None),
            )
        )
        total_duration, avg_duration = duration_result.one()
        total_duration_hours = (total_duration or 0) / 3600
        avg_duration_minutes = (avg_duration or 0) / 60

        # Meetings this week
        week_start = now - timedelta(days=now.weekday())
        week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
        week_result = await self.db.execute(
            select(func.count(Meeting.id)).where(
                Meeting.created_by == user_id,
                Meeting.is_archived == False,
                Meeting.meeting_date >= week_start,
            )
        )
        meetings_this_week = week_result.scalar() or 0

        # Meetings this month
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_result = await self.db.execute(
            select(func.count(Meeting.id)).where(
                Meeting.created_by == user_id,
                Meeting.is_archived == False,
                Meeting.meeting_date >= month_start,
            )
        )
        meetings_this_month = month_result.scalar() or 0

        # Action items stats
        ai_total_result = await self.db.execute(
            select(func.count(ActionItem.id))
            .join(Meeting, ActionItem.meeting_id == Meeting.id)
            .where(Meeting.created_by == user_id, Meeting.is_archived == False)
        )
        action_items_total = ai_total_result.scalar() or 0

        ai_completed_result = await self.db.execute(
            select(func.count(ActionItem.id))
            .join(Meeting, ActionItem.meeting_id == Meeting.id)
            .where(
                Meeting.created_by == user_id,
                Meeting.is_archived == False,
                ActionItem.status == "completed",
            )
        )
        action_items_completed = ai_completed_result.scalar() or 0

        action_items_pending = action_items_total - action_items_completed

        # Top meeting types
        types_result = await self.db.execute(
            select(Meeting.meeting_type, func.count(Meeting.id).label("count"))
            .where(Meeting.created_by == user_id, Meeting.is_archived == False)
            .group_by(Meeting.meeting_type)
            .order_by(func.count(Meeting.id).desc())
            .limit(5)
        )
        top_meeting_types = [{"type": row[0], "count": row[1]} for row in types_result.all()]

        # Meetings by status
        status_result = await self.db.execute(
            select(Meeting.status, func.count(Meeting.id).label("count"))
            .where(Meeting.created_by == user_id, Meeting.is_archived == False)
            .group_by(Meeting.status)
        )
        meetings_by_status = {row[0]: row[1] for row in status_result.all()}

        return MeetingStats(
            total_meetings=total_meetings,
            total_duration_hours=round(total_duration_hours, 1),
            avg_duration_minutes=round(avg_duration_minutes, 1),
            meetings_this_week=meetings_this_week,
            meetings_this_month=meetings_this_month,
            action_items_total=action_items_total,
            action_items_completed=action_items_completed,
            action_items_pending=action_items_pending,
            top_meeting_types=top_meeting_types,
            meetings_by_status=meetings_by_status,
        )

    async def get_speaker_stats(
        self, user_id: uuid.UUID, meeting_id: str | None = None
    ) -> list[SpeakerStats]:
        """Get speaker statistics."""
        query = (
            select(Speaker, func.count(Meeting.id).label("meetings_count"))
            .join(Meeting, Speaker.meeting_id == Meeting.id)
            .where(Meeting.created_by == user_id, Meeting.is_archived == False)
        )

        if meeting_id:
            query = query.where(Speaker.meeting_id == uuid.UUID(meeting_id))

        query = query.group_by(Speaker.id).order_by(Speaker.total_speaking_time.desc())

        result = await self.db.execute(query)
        rows = result.all()

        stats = []
        for speaker, meetings_count in rows:
            avg_seg_length = (
                speaker.total_speaking_time / speaker.segment_count
                if speaker.segment_count > 0
                else 0.0
            )
            stats.append(
                SpeakerStats(
                    speaker_id=str(speaker.id),
                    speaker_name=speaker.name,
                    total_speaking_time=round(speaker.total_speaking_time, 1),
                    segment_count=speaker.segment_count,
                    avg_segment_length=round(avg_seg_length, 1),
                    meetings_count=meetings_count,
                )
            )

        return stats

    async def _get_activity_trend(
        self, user_id: uuid.UUID, days: int = 30
    ) -> list[dict]:
        """Get daily meeting count trend."""
        now = datetime.now(timezone.utc)
        start_date = now - timedelta(days=days)

        result = await self.db.execute(
            select(
                func.date(Meeting.meeting_date).label("date"),
                func.count(Meeting.id).label("count"),
            )
            .where(
                Meeting.created_by == user_id,
                Meeting.is_archived == False,
                Meeting.meeting_date >= start_date,
            )
            .group_by(func.date(Meeting.meeting_date))
            .order_by(func.date(Meeting.meeting_date))
        )

        return [{"date": str(row[0]), "count": row[1]} for row in result.all()]
