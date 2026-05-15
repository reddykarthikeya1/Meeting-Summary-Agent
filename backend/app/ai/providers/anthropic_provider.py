from typing import AsyncIterator
import anthropic
from app.ai.base import AIProvider
from app.ai.factory import AIProviderFactory


class AnthropicProvider(AIProvider):
    """Anthropic AI provider using the official SDK."""

    def __init__(self, api_key: str, **kwargs):
        self.api_key = api_key
        self.client = anthropic.AsyncAnthropic(api_key=api_key)
        self.default_model = kwargs.get("model", "claude-sonnet-4-20250514")

    async def generate_text(
        self,
        prompt: str,
        system_prompt: str | None = None,
        max_tokens: int = 4096,
        temperature: float = 0.7,
    ) -> str:
        kwargs = {
            "model": self.default_model,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": [{"role": "user", "content": prompt}],
        }
        if system_prompt:
            kwargs["system"] = system_prompt

        response = await self.client.messages.create(**kwargs)
        return response.content[0].text

    async def generate_stream(
        self,
        prompt: str,
        system_prompt: str | None = None,
        max_tokens: int = 4096,
        temperature: float = 0.7,
    ) -> AsyncIterator[str]:
        kwargs = {
            "model": self.default_model,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "messages": [{"role": "user", "content": prompt}],
        }
        if system_prompt:
            kwargs["system"] = system_prompt

        async with self.client.messages.stream(**kwargs) as stream:
            async for text in stream.text_stream:
                yield text

    async def get_embedding(self, text: str) -> list[float]:
        raise NotImplementedError(
            "Anthropic does not provide an embedding API. "
            "Use OpenAI, Gemini, or Mistral for embeddings."
        )

    def get_name(self) -> str:
        return "anthropic"

    def get_models(self) -> list[str]:
        return ["claude-sonnet-4-20250514", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"]


# Auto-register the provider
AIProviderFactory.register("anthropic", AnthropicProvider)
