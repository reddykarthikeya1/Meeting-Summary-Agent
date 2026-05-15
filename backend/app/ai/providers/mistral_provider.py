from typing import AsyncIterator
from mistralai.async_client import MistralAsyncClient
from app.ai.base import AIProvider
from app.ai.factory import AIProviderFactory


class MistralProvider(AIProvider):
    """Mistral AI provider using the mistralai SDK."""

    def __init__(self, api_key: str, **kwargs):
        self.api_key = api_key
        self.client = MistralAsyncClient(api_key=api_key)
        self.default_model = kwargs.get("model", "mistral-large-latest")

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

        response = await self.client.chat(
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

        stream = self.client.chat_stream(
            model=self.default_model,
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )
        async for chunk in stream:
            if chunk.data and chunk.data.choices:
                delta = chunk.data.choices[0].delta
                if delta and delta.content:
                    yield delta.content

    async def get_embedding(self, text: str) -> list[float]:
        response = await self.client.embeddings(
            model="mistral-embed",
            input=[text],
        )
        return response.data[0].embedding

    def get_name(self) -> str:
        return "mistral"

    def get_models(self) -> list[str]:
        return ["mistral-large-latest", "mistral-medium-latest", "mistral-small-latest"]


# Auto-register the provider
AIProviderFactory.register("mistral", MistralProvider)
