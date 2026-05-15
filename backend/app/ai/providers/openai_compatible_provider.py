"""
Generic OpenAI-compatible provider.
Works with any service that exposes an OpenAI-compatible chat completions API:
- Qwen (vLLM, Ollama, SGLang)
- Groq
- OpenRouter
- Together AI
- Fireworks AI
- Deepseek
- Mistral (also has native SDK but OpenAI-compatible endpoint works too)
- Any self-hosted model behind an OpenAI-compatible proxy
"""
from typing import AsyncIterator
from openai import AsyncOpenAI
from app.ai.base import AIProvider
from app.ai.factory import AIProviderFactory


class OpenAICompatibleProvider(AIProvider):
    """Provider for any OpenAI-compatible API endpoint."""

    def __init__(self, api_key: str = "not-needed", **kwargs):
        self.api_key = api_key
        self.base_url = kwargs.get("base_url", "https://api.openai.com/v1")
        self.client = AsyncOpenAI(api_key=api_key, base_url=self.base_url)
        self.default_model = kwargs.get("model", "gpt-4o")
        self.embedding_model = kwargs.get("embedding_model", "text-embedding-3-small")
        self._name = kwargs.get("provider_name", "openai-compatible")

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
        return self._name

    def get_models(self) -> list[str]:
        return [self.default_model]


# Register with multiple names so the factory can create them
def _register():
    """Register this provider under common OpenAI-compatible service names."""
    providers = {
        "groq": {
            "base_url": "https://api.groq.com/openai/v1",
            "model": "llama-3.3-70b-versatile",
            "provider_name": "groq",
        },
        "openrouter": {
            "base_url": "https://openrouter.ai/api/v1",
            "model": "anthropic/claude-sonnet-4-20250514",
            "provider_name": "openrouter",
        },
        "together": {
            "base_url": "https://api.together.xyz/v1",
            "model": "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
            "provider_name": "together",
        },
        "fireworks": {
            "base_url": "https://api.fireworks.ai/inference/v1",
            "model": "accounts/fireworks/models/llama-v3p1-70b-instruct",
            "provider_name": "fireworks",
        },
        "deepseek": {
            "base_url": "https://api.deepseek.com/v1",
            "model": "deepseek-chat",
            "provider_name": "deepseek",
        },
    }

    for name, defaults in providers.items():
        def make_factory(n, d):
            def factory(api_key: str = "", **kwargs):
                merged = {**d, **kwargs}
                return OpenAICompatibleProvider(api_key=api_key, **merged)
            return factory
        AIProviderFactory.register(name, make_factory(name, defaults))

_register()
