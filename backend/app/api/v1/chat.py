"""
Chat endpoint for multi-provider LLM conversations.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.dependencies import get_current_user
from app.models.user import User
from app.ai.factory import AIProviderFactory

router = APIRouter(tags=["Chat"])


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    provider: str = "openai"
    model: str | None = None
    system_prompt: str | None = None
    temperature: float = 0.7
    max_tokens: int = 4096


class ChatResponse(BaseModel):
    response: str
    provider: str
    model: str
    tokens_used: int | None = None


@router.post("/chat", response_model=ChatResponse)
async def chat(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Send a chat message to any configured AI provider.
    Supports multi-turn conversations with full message history.
    """
    if not req.messages:
        raise HTTPException(status_code=400, detail="Messages cannot be empty.")

    try:
        kwargs = {}
        if req.model:
            kwargs["model"] = req.model

        provider = AIProviderFactory.create(req.provider, **kwargs)

        # Build conversation history as context for multi-turn
        if len(req.messages) > 1:
            # Format previous messages as context
            history_lines = []
            for msg in req.messages[:-1]:
                role_label = "User" if msg.role == "user" else "Assistant"
                history_lines.append(f"{role_label}: {msg.content}")
            history_text = "\n\n".join(history_lines)
            last_msg = req.messages[-1].content
            # Combine history with last message
            full_prompt = f"Previous conversation:\n{history_text}\n\nUser: {last_msg}\n\nAssistant:"
        else:
            full_prompt = req.messages[-1].content

        # Use the provider to generate a response
        response = await provider.generate_text(
            prompt=full_prompt,
            system_prompt=req.system_prompt or "You are a helpful AI assistant.",
            max_tokens=req.max_tokens,
            temperature=req.temperature,
        )

        return ChatResponse(
            response=response,
            provider=req.provider,
            model=req.model or "default",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/chat/providers")
async def list_chat_providers(
    current_user: User = Depends(get_current_user),
):
    """List all available chat providers with their models."""
    providers = []
    for name in AIProviderFactory.list_providers():
        try:
            provider = AIProviderFactory.create(name)
            providers.append({
                "id": name,
                "name": provider.get_name(),
                "models": provider.get_models(),
            })
        except Exception:
            providers.append({
                "id": name,
                "name": name,
                "models": [],
            })
    return {"providers": providers}
