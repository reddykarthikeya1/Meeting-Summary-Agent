from typing import Any
from app.ai.base import AIProvider
from app.config import settings


# Maps provider names to their env var for API key
_KEY_MAP: dict[str, str] = {
    "openai": "OPENAI_API_KEY",
    "anthropic": "ANTHROPIC_API_KEY",
    "gemini": "GEMINI_API_KEY",
    "mistral": "MISTRAL_API_KEY",
    "groq": "GROQ_API_KEY",
    "openrouter": "OPENROUTER_API_KEY",
    "together": "TOGETHER_API_KEY",
    "fireworks": "FIREWORKS_API_KEY",
    "deepseek": "DEEPSEEK_API_KEY",
    "qwen": "QWEN_API_KEY",
    "custom": "CUSTOM_API_KEY",
}

# Default models for each provider
_DEFAULT_MODELS: dict[str, str] = {
    "openai": "gpt-4o",
    "anthropic": "claude-sonnet-4-20250514",
    "gemini": "gemini-pro",
    "mistral": "mistral-large-latest",
    "groq": "llama-3.3-70b-versatile",
    "openrouter": "anthropic/claude-sonnet-4-20250514",
    "together": "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
    "fireworks": "accounts/fireworks/models/llama-v3p1-70b-instruct",
    "deepseek": "deepseek-chat",
    "qwen": "qwen3-30b-a3b",
    "custom": "gpt-4o",
}


class AIProviderFactory:
    """Factory for creating AI provider instances."""

    _providers: dict[str, type[AIProvider]] = {}

    @classmethod
    def register(cls, name: str, provider_class: type[AIProvider]) -> None:
        cls._providers[name] = provider_class

    @classmethod
    def create(cls, name: str, api_key: str | None = None, **kwargs: Any) -> AIProvider:
        if name not in cls._providers:
            raise ValueError(
                f"Unknown AI provider: {name}. Available: {list(cls._providers.keys())}"
            )

        provider_class = cls._providers[name]

        # Resolve API key from settings if not provided
        env_var = _KEY_MAP.get(name, "")
        resolved_key = (api_key or getattr(settings, env_var, "")) if env_var else (api_key or "")

        # Inject defaults for specific providers
        if name == "qwen":
            kwargs.setdefault("base_url", settings.QWEN_BASE_URL)
            kwargs.setdefault("model", settings.QWEN_MODEL)

        if name == "custom":
            kwargs.setdefault("base_url", settings.CUSTOM_BASE_URL)
            kwargs.setdefault("model", settings.CUSTOM_MODEL or "gpt-4o")

        kwargs.setdefault("model", _DEFAULT_MODELS.get(name, "gpt-4o"))

        return provider_class(api_key=resolved_key, **kwargs)

    @classmethod
    def get_default(cls, user_preferences: dict | None = None) -> AIProvider:
        preferred = None
        if user_preferences:
            preferred = user_preferences.get("ai_provider")

        if preferred and preferred in cls._providers:
            return cls.create(preferred)

        # Fallback: try each provider in order until one has a key
        for name in ["openai", "anthropic", "gemini", "groq", "mistral", "qwen"]:
            env_var = _KEY_MAP.get(name, "")
            if env_var and getattr(settings, env_var, ""):
                return cls.create(name)

        raise ValueError("No AI provider configured. Set at least one API key in environment.")

    @classmethod
    def list_providers(cls) -> list[str]:
        return list(cls._providers.keys())
