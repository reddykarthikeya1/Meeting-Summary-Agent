"""
AI Provider management endpoints.
Allows the frontend to list, configure, test, and set default providers.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.ai.factory import AIProviderFactory
from app.config import settings

router = APIRouter(tags=["providers"])


# ── Available provider metadata ────────────────────────────────

PROVIDER_META = {
    "openai": {
        "name": "OpenAI",
        "description": "GPT-4o, GPT-4o-mini, GPT-3.5-turbo",
        "models": ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
        "requires_key": True,
        "key_url": "https://platform.openai.com/api-keys",
    },
    "anthropic": {
        "name": "Anthropic",
        "description": "Claude Sonnet, Claude Haiku",
        "models": ["claude-sonnet-4-20250514", "claude-3-haiku-20240307"],
        "requires_key": True,
        "key_url": "https://console.anthropic.com/",
    },
    "gemini": {
        "name": "Google Gemini",
        "description": "Gemini Pro, Gemini Pro Vision",
        "models": ["gemini-pro", "gemini-pro-vision", "gemini-1.5-flash"],
        "requires_key": True,
        "key_url": "https://aistudio.google.com/app/apikey",
    },
    "groq": {
        "name": "Groq",
        "description": "Ultra-fast inference for Llama, Mixtral, Gemma",
        "models": ["llama-3.3-70b-versatile", "mixtral-8x7b-32768", "gemma2-9b-it"],
        "requires_key": True,
        "key_url": "https://console.groq.com/keys",
    },
    "openrouter": {
        "name": "OpenRouter",
        "description": "Access 100+ models through one API",
        "models": ["anthropic/claude-sonnet-4-20250514", "meta-llama/llama-3.1-70b-instruct", "google/gemini-pro-1.5"],
        "requires_key": True,
        "key_url": "https://openrouter.ai/keys",
    },
    "mistral": {
        "name": "Mistral",
        "description": "Mistral Large, Medium, Small",
        "models": ["mistral-large-latest", "mistral-medium", "mistral-small-latest"],
        "requires_key": True,
        "key_url": "https://console.mistral.ai/",
    },
    "together": {
        "name": "Together AI",
        "description": "Fast inference for open-source models",
        "models": ["meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", "mistralai/Mixtral-8x7B-Instruct-v0.1"],
        "requires_key": True,
        "key_url": "https://api.together.xyz/settings/api-keys",
    },
    "fireworks": {
        "name": "Fireworks AI",
        "description": "Fast inference for open models",
        "models": ["accounts/fireworks/models/llama-v3p1-70b-instruct"],
        "requires_key": True,
        "key_url": "https://fireworks.ai/account/api-keys",
    },
    "deepseek": {
        "name": "DeepSeek",
        "description": "DeepSeek Chat, DeepSeek Coder",
        "models": ["deepseek-chat", "deepseek-coder"],
        "requires_key": True,
        "key_url": "https://platform.deepseek.com/api_keys",
    },
    "qwen": {
        "name": "Qwen (Self-Hosted)",
        "description": "Self-hosted Qwen via vLLM, Ollama, etc.",
        "models": ["qwen3-30b-a3b", "qwen3-235b-a22b", "qwen3-32b", "qwen3-14b", "qwen3-8b"],
        "requires_key": False,
        "key_url": None,
    },
    "custom": {
        "name": "Custom (OpenAI-Compatible)",
        "description": "Any OpenAI-compatible API endpoint",
        "models": [],
        "requires_key": False,
        "key_url": None,
    },
}


# ── Request / Response Models ──────────────────────────────────

class ProviderConfig(BaseModel):
    provider: str
    api_key: str | None = None
    base_url: str | None = None
    model: str | None = None


class TestResult(BaseModel):
    provider: str
    success: bool
    message: str
    model: str


# ── Endpoints ──────────────────────────────────────────────────

@router.get("/")
async def list_providers():
    """List all available providers with their metadata and connection status."""
    providers = []
    for pid, meta in PROVIDER_META.items():
        env_var = {
            "openai": settings.OPENAI_API_KEY,
            "anthropic": settings.ANTHROPIC_API_KEY,
            "gemini": settings.GEMINI_API_KEY,
            "groq": settings.GROQ_API_KEY,
            "openrouter": settings.OPENROUTER_API_KEY,
            "mistral": settings.MISTRAL_API_KEY,
            "together": settings.TOGETHER_API_KEY,
            "fireworks": settings.FIREWORKS_API_KEY,
            "deepseek": settings.DEEPSEEK_API_KEY,
            "qwen": settings.QWEN_API_KEY,
            "custom": settings.CUSTOM_API_KEY,
        }.get(pid, "")

        has_key = bool(env_var) and env_var != "not-needed"
        is_configured = has_key or pid in ("qwen", "custom")

        providers.append({
            "id": pid,
            **meta,
            "is_configured": is_configured,
        })

    return {"providers": providers}


@router.post("/test")
async def test_provider(config: ProviderConfig):
    """Test a provider connection by sending a simple prompt."""
    try:
        kwargs = {}
        if config.api_key:
            kwargs["api_key"] = config.api_key
        if config.base_url:
            kwargs["base_url"] = config.base_url
        if config.model:
            kwargs["model"] = config.model

        provider = AIProviderFactory.create(config.provider, **kwargs)
        response = await provider.generate_text(
            "Say 'Hello from MeetAI!' in exactly those words.",
            max_tokens=20,
            temperature=0,
        )

        return TestResult(
            provider=config.provider,
            success=True,
            message=response.strip(),
            model=config.model or "default",
        )
    except Exception as e:
        return TestResult(
            provider=config.provider,
            success=False,
            message=str(e),
            model=config.model or "default",
        )


@router.post("/configure")
async def configure_provider(config: ProviderConfig):
    """
    Save provider configuration.
    In production, this would update the database and environment.
    For now, it validates the connection and returns success.
    """
    # Test the connection first
    try:
        kwargs = {}
        if config.api_key:
            kwargs["api_key"] = config.api_key
        if config.base_url:
            kwargs["base_url"] = config.base_url
        if config.model:
            kwargs["model"] = config.model

        provider = AIProviderFactory.create(config.provider, **kwargs)
        await provider.generate_text("Test", max_tokens=5, temperature=0)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Connection test failed: {str(e)}")

    return {
        "status": "configured",
        "provider": config.provider,
        "message": f"{PROVIDER_META.get(config.provider, {}).get('name', config.provider)} configured successfully.",
    }
