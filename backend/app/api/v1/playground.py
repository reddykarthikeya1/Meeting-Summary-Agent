"""
AI Playground endpoints for testing transcription, summarization, and extraction.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.ai.factory import AIProviderFactory
from app.ai.agents.summarizer import SummarizerAgent
from app.ai.agents.action_extractor import ActionExtractorAgent
from app.ai.agents.topic_analyzer import TopicAnalyzerAgent

router = APIRouter(tags=["Playground"])


class SummarizeRequest(BaseModel):
    transcript: str
    provider: str = "openai"
    summary_type: str = "brief"
    model: str | None = None


class ExtractActionsRequest(BaseModel):
    transcript: str
    provider: str = "openai"
    model: str | None = None
    participants: list[str] | None = None


class AnalyzeTopicsRequest(BaseModel):
    transcript: str
    provider: str = "openai"
    model: str | None = None


@router.post("/summarize")
async def playground_summarize(
    req: SummarizeRequest,
    current_user: User = Depends(get_current_user),
):
    """Test summarization on a transcript."""
    if not req.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript cannot be empty.")

    try:
        kwargs = {}
        if req.model:
            kwargs["model"] = req.model
        provider = AIProviderFactory.create(req.provider, **kwargs)
        agent = SummarizerAgent(provider)

        summary = await agent.summarize(
            transcript=req.transcript,
            summary_type=req.summary_type,
        )

        return {
            "result": summary,
            "provider": req.provider,
            "summary_type": req.summary_type,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/extract-actions")
async def playground_extract_actions(
    req: ExtractActionsRequest,
    current_user: User = Depends(get_current_user),
):
    """Test action item extraction on a transcript."""
    if not req.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript cannot be empty.")

    try:
        kwargs = {}
        if req.model:
            kwargs["model"] = req.model
        provider = AIProviderFactory.create(req.provider, **kwargs)
        agent = ActionExtractorAgent(provider)

        items = await agent.extract(
            transcript=req.transcript,
            participants=req.participants,
        )

        return {
            "action_items": items,
            "provider": req.provider,
            "count": len(items),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-topics")
async def playground_analyze_topics(
    req: AnalyzeTopicsRequest,
    current_user: User = Depends(get_current_user),
):
    """Test topic analysis on a transcript."""
    if not req.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript cannot be empty.")

    try:
        kwargs = {}
        if req.model:
            kwargs["model"] = req.model
        provider = AIProviderFactory.create(req.provider, **kwargs)
        agent = TopicAnalyzerAgent(provider)

        topics = await agent.analyze(transcript=req.transcript)

        return {
            "topics": topics,
            "provider": req.provider,
            "count": len(topics),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
