from abc import ABC, abstractmethod
from typing import AsyncIterator


class AIProvider(ABC):
    """Abstract base class for all AI providers."""

    @abstractmethod
    async def generate_text(
        self,
        prompt: str,
        system_prompt: str | None = None,
        max_tokens: int = 4096,
        temperature: float = 0.7,
    ) -> str:
        """Generate text from a prompt."""
        ...

    @abstractmethod
    async def generate_stream(
        self,
        prompt: str,
        system_prompt: str | None = None,
        max_tokens: int = 4096,
        temperature: float = 0.7,
    ) -> AsyncIterator[str]:
        """Stream text generation from a prompt."""
        ...

    @abstractmethod
    async def get_embedding(self, text: str) -> list[float]:
        """Get embedding vector for text."""
        ...

    @abstractmethod
    def get_name(self) -> str:
        """Return the provider name."""
        ...

    @abstractmethod
    def get_models(self) -> list[str]:
        """Return available models for this provider."""
        ...
