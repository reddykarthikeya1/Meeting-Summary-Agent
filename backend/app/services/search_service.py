"""Search service for full-text search across meetings."""
import uuid
from datetime import datetime
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.meeting import Meeting
from app.models.transcript import TranscriptSegment
from app.models.summary import Summary
from app.models.action_item import ActionItem
from app.schemas.search import SearchResult, SearchResultItem
from app.core.exceptions import ValidationError


class SearchService:
    """Service for searching across meetings, transcripts, summaries, and action items."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def search(
        self,
        query: str,
        user_id: uuid.UUID,
        meeting_type: str | None = None,
        date_from: str | None = None,
        date_to: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> SearchResult:
        """Search across meetings, transcripts, summaries, and action items.

        Args:
            query: Search query string.
            user_id: Current user ID.
            meeting_type: Optional meeting type filter.
            date_from: Optional start date filter (ISO format).
            date_to: Optional end date filter (ISO format).
            page: Page number.
            page_size: Results per page.

        Returns:
            SearchResult with matching items.
        """
        if not query.strip():
            raise ValidationError("Search query cannot be empty.")

        search_pattern = f"%{query}%"
        results: list[SearchResultItem] = []

        # Build base meeting filter
        meeting_filters = [Meeting.created_by == user_id, Meeting.is_archived == False]
        if meeting_type:
            meeting_filters.append(Meeting.meeting_type == meeting_type)
        if date_from:
            try:
                dt_from = datetime.fromisoformat(date_from)
                meeting_filters.append(Meeting.meeting_date >= dt_from)
            except ValueError:
                pass
        if date_to:
            try:
                dt_to = datetime.fromisoformat(date_to)
                meeting_filters.append(Meeting.meeting_date <= dt_to)
            except ValueError:
                pass

        # Search meeting titles
        title_query = select(Meeting).where(
            and_(*meeting_filters, Meeting.title.ilike(search_pattern))
        )
        title_result = await self.db.execute(title_query)
        for meeting in title_result.scalars().all():
            results.append(
                SearchResultItem(
                    meeting_id=str(meeting.id),
                    meeting_title=meeting.title,
                    match_type="title",
                    match_text=meeting.title,
                    relevance_score=1.0,
                    meeting_date=str(meeting.meeting_date.date()),
                )
            )

        # Search transcripts
        transcript_query = (
            select(TranscriptSegment, Meeting)
            .join(Meeting, TranscriptSegment.meeting_id == Meeting.id)
            .where(and_(*meeting_filters, TranscriptSegment.text.ilike(search_pattern)))
            .limit(100)
        )
        transcript_result = await self.db.execute(transcript_query)
        seen_meetings = {r.meeting_id for r in results}
        for seg, meeting in transcript_result.all():
            mid = str(meeting.id)
            if mid not in seen_meetings:
                seen_meetings.add(mid)
                # Get a snippet around the match
                text = seg.text
                idx = text.lower().find(query.lower())
                start = max(0, idx - 50)
                end = min(len(text), idx + len(query) + 50)
                snippet = f"...{text[start:end]}..."

                results.append(
                    SearchResultItem(
                        meeting_id=mid,
                        meeting_title=meeting.title,
                        match_type="transcript",
                        match_text=snippet,
                        relevance_score=0.8,
                        meeting_date=str(meeting.meeting_date.date()),
                    )
                )

        # Search summaries
        summary_query = (
            select(Summary, Meeting)
            .join(Meeting, Summary.meeting_id == Meeting.id)
            .where(and_(*meeting_filters, Summary.content.ilike(search_pattern)))
            .limit(50)
        )
        summary_result = await self.db.execute(summary_query)
        for summary, meeting in summary_result.all():
            mid = str(meeting.id)
            if mid not in seen_meetings:
                seen_meetings.add(mid)
                content = summary.content
                idx = content.lower().find(query.lower())
                start = max(0, idx - 50)
                end = min(len(content), idx + len(query) + 50)
                snippet = f"...{content[start:end]}..."

                results.append(
                    SearchResultItem(
                        meeting_id=mid,
                        meeting_title=meeting.title,
                        match_type="summary",
                        match_text=snippet,
                        relevance_score=0.7,
                        meeting_date=str(meeting.meeting_date.date()),
                    )
                )

        # Search action items
        action_query = (
            select(ActionItem, Meeting)
            .join(Meeting, ActionItem.meeting_id == Meeting.id)
            .where(and_(*meeting_filters, ActionItem.description.ilike(search_pattern)))
            .limit(50)
        )
        action_result = await self.db.execute(action_query)
        for item, meeting in action_result.all():
            mid = str(meeting.id)
            if mid not in seen_meetings:
                seen_meetings.add(mid)
                results.append(
                    SearchResultItem(
                        meeting_id=mid,
                        meeting_title=meeting.title,
                        match_type="action_item",
                        match_text=item.description,
                        relevance_score=0.6,
                        meeting_date=str(meeting.meeting_date.date()),
                    )
                )

        # Sort by relevance and paginate
        results.sort(key=lambda x: x.relevance_score, reverse=True)
        total = len(results)
        offset = (page - 1) * page_size
        paginated = results[offset : offset + page_size]

        return SearchResult(
            items=paginated,
            total=total,
            query=query,
            page=page,
            page_size=page_size,
        )

    async def get_suggestions(
        self, user_id: uuid.UUID, query: str
    ) -> list[str]:
        """Get search suggestions based on partial query."""
        if not query or len(query) < 2:
            return []

        search_pattern = f"{query}%"
        suggestions = set()

        # Suggest from meeting titles
        result = await self.db.execute(
            select(Meeting.title)
            .where(
                Meeting.created_by == user_id,
                Meeting.is_archived == False,
                Meeting.title.ilike(search_pattern),
            )
            .limit(5)
        )
        for row in result.scalars().all():
            suggestions.add(row)

        # Suggest from participant names
        from app.models.meeting import MeetingParticipant

        result = await self.db.execute(
            select(MeetingParticipant.name)
            .join(Meeting, MeetingParticipant.meeting_id == Meeting.id)
            .where(
                Meeting.created_by == user_id,
                MeetingParticipant.name.ilike(search_pattern),
            )
            .distinct()
            .limit(5)
        )
        for row in result.scalars().all():
            suggestions.add(row)

        return sorted(suggestions)[:10]
