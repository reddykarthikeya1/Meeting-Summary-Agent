from typing import Any
from app.ai.base import AIProvider
from app.config import settings


class AIProviderFactory:
    """Factory for creating AI provider instances."""

    _providers: dict[str, type[AIProvider]] = {}

    @classmethod
    def register(cls, name: str, provider_class: type[AIProvider]) -> None:
        """Register an AI provider class."""
        cls._providers[name] = provider_class

    @classmethod
    def create(cls, name: str, api_key: str | None = None, **kwargs: Any) -> AIProvider:
        """Create an AI provider instance by name."""
        if name not in cls._providers:
            raise ValueError(
                f"Unknown AI provider: {name}. Available: {list(cls._providers.keys())}"
            )

        provider_class = cls._providers[name]

        # Resolve API key from settings if not provided
        key_map = {
            "openai": settings.OPENAI_API_KEY,
            "anthropic": settings.ANTHROPIC_API_KEY,
            "gemini": settings.GEMINI_API_KEY,
            "mistral": settings.MISTRAL_API_KEY,
        }
        resolved_key = api_key or key_map.get(name, "")

        return provider_class(api_key=resolved_key, **kwargs)

    @classmethod
    def get_default(cls, user_preferences: dict | None = None) -> AIProvider:
        """Get the default AI provider based on user preferences or availability."""
        preferred = None
        if user_preferences:
            preferred = user_preferences.get("ai_provider")

        if preferred and preferred in cls._providers:
            return cls.create(preferred)

        # Fallback order: openai, anthropic, gemini, mistral
        for name in ["openai", "anthropic", "gemini", "mistral"]:
            key_map = {
                "openai": settings.OPENAI_API_KEY,
                "anthropic": settings.ANTHROPIC_API_KEY,
                "gemini": settings.GEMINI_API_KEY,
                "mistral": settings.MISTRAL_API_KEY,
            }
            if key_map.get(name):
                return cls.create(name)

        raise ValueError("No AI provider configured. Set at least one API key in environment.")

    @classmethod
    def list_providers(cls) -> list[str]:
        """List all registered provider names."""
        return list(cls._providers.keys())
