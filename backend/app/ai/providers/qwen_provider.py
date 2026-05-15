"""
Qwen provider using OpenAI-compatible API.
Works with self-hosted Qwen models served via vLLM, Ollama, SGLang, etc.
"""
from typing import AsyncIterator
from openai import AsyncOpenAI
from app.ai.base import AIProvider
from app.ai.factory import AIProviderFactory


class QwenProvider(AIProvider):
    """Qwen AI provider using OpenAI-compatible API."""

    def __init__(self, api_key: str = "not-needed", **kwargs):
        self.api_key = api_key
        self.base_url = kwargs.get("base_url", "http://localhost:11434/v1")
        self.client = AsyncOpenAI(api_key=api_key, base_url=self.base_url)
        self.default_model = kwargs.get("model", "qwen3-30b-a3b")

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
            model="text-embedding-v3",
            input=text,
        )
        return response.data[0].embedding

    def get_name(self) -> str:
        return "qwen"

    def get_models(self) -> list[str]:
        return [
            "qwen3-30b-a3b",
            "qwen3-235b-a22b",
            "qwen3-32b",
            "qwen3-14b",
            "qwen3-8b",
            "qwen2.5-72b-instruct",
            "qwen2.5-32b-instruct",
        ]


# Auto-register the provider
AIProviderFactory.register("qwen", QwenProvider)
