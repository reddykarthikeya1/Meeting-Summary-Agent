from typing import AsyncIterator
from openai import AsyncOpenAI
from app.ai.base import AIProvider
from app.ai.factory import AIProviderFactory


class OpenAIProvider(AIProvider):
    """OpenAI AI provider using the official SDK."""

    def __init__(self, api_key: str, **kwargs):
        self.api_key = api_key
        self.client = AsyncOpenAI(api_key=api_key)
        self.default_model = kwargs.get("model", "gpt-4o")
        self.embedding_model = kwargs.get("embedding_model", "text-embedding-3-small")

    async def generate_text(
        self,
        prompt: str,
        system_prompt: str | None = None,
        max_tokens: int = 4096,
        temperature: float = 0.7,
    ) -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = await self.client.chat.completions.create(
            model=self.default_model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )
        return response.choices[0].message.content or ""

    async def generate_stream(
        self,
        prompt: str,
        system_prompt: str | None = None,
        max_tokens: int = 4096,
        temperature: float = 0.7,
    ) -> AsyncIterator[str]:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        stream = await self.client.chat.completions.create(
            model=self.default_model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
            stream=True,
        )
        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    async def get_embedding(self, text: str) -> list[float]:
        response = await self.client.embeddings.create(
            model=self.embedding_model,
            input=text,
        )
        return response.data[0].embedding

    def get_name(self) -> str:
        return "openai"

    def get_models(self) -> list[str]:
        return ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"]


# Auto-register the provider
AIProviderFactory.register("openai", OpenAIProvider)
