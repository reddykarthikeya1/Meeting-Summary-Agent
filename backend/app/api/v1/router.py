from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.meetings import router as meetings_router
from app.api.v1.transcripts import router as transcripts_router
from app.api.v1.summaries import router as summaries_router
from app.api.v1.action_items import router as action_items_router
from app.api.v1.search import router as search_router
from app.api.v1.templates import router as templates_router
from app.api.v1.comments import router as comments_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.export import router as export_router
from app.api.v1.ws import router as ws_router
from app.api.v1.teams import router as teams_router
from app.api.v1.providers import router as providers_router
from app.api.v1.setup import router as setup_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(meetings_router, prefix="/meetings", tags=["Meetings"])
api_router.include_router(transcripts_router, prefix="/meetings", tags=["Transcripts"])
api_router.include_router(summaries_router, prefix="/meetings", tags=["Summaries"])
api_router.include_router(action_items_router, tags=["Action Items"])
api_router.include_router(search_router, prefix="/search", tags=["Search"])
api_router.include_router(templates_router, prefix="/templates", tags=["Templates"])
api_router.include_router(comments_router, tags=["Comments"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(export_router, prefix="/meetings", tags=["Export"])
api_router.include_router(ws_router, tags=["WebSocket"])
api_router.include_router(teams_router, prefix="/teams", tags=["Teams Integration"])
api_router.include_router(providers_router, prefix="/providers", tags=["AI Providers"])
api_router.include_router(setup_router, prefix="/setup", tags=["Setup"])
