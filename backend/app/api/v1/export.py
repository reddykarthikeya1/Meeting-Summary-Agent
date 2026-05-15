import uuid
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.services.export_service import ExportService

router = APIRouter()


@router.post("/{meeting_id}/export")
async def export_meeting(
    meeting_id: uuid.UUID,
    format: str = "pdf",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Export a meeting in the specified format (pdf, markdown, json)."""
    service = ExportService(db)
    result = await service.export_meeting(meeting_id, current_user.id, format=format)

    if format == "json":
        return result

    return StreamingResponse(
        iter([result["content"]]),
        media_type=result["media_type"],
        headers={"Content-Disposition": f'attachment; filename="{result["filename"]}"'},
    )
