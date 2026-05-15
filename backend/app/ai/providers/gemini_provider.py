from typing import AsyncIterator
import google.generativeai as genai
from app.ai.base import AIProvider
from app.ai.factory import AIProviderFactory


class GeminiProvider(AIProvider):
    """Google Gemini AI provider using the google-generativeai SDK."""

    def __init__(self, api_key: str, **kwargs):
        self.api_key = api_key
        genai.configure(api_key=api_key)
        self.default_model_name = kwargs.get("model", "gemini-1.5-pro")
        self.model = genai.GenerativeModel(self.default_model_name)

    async def generate_text(
        self,
        prompt: str,
        system_prompt: str | None = None,
        max_tokens: int = 4096,
        temperature: float = 0.7,
    ) -> str:
        import asyncio

        full_prompt = prompt
        if system_prompt:
            full_prompt = f"{system_prompt}\n\n{prompt}"

        generation_config = genai.types.GenerationConfig(
            max_output_tokens=max_tokens,
            temperature=temperature,
        )

        response = await asyncio.to_thread(
            self.model.generate_content,
            full_prompt,
            generation_config=generation_config,
        )
        return response.text

    async def generate_stream(
        self,
        prompt: str,
        system_prompt: str | None = None,
        max_tokens: int = 4096,
        temperature: float = 0.7,
    ) -> AsyncIterator[str]:
        import asyncio

        full_prompt = prompt
        if system_prompt:
            full_prompt = f"{system_prompt}\n\n{prompt}"

        generation_config = genai.types.GenerationConfig(
            max_output_tokens=max_tokens,
            temperature=temperature,
        )

        def _stream():
            return self.model.generate_content(
                full_prompt,
                generation_config=generation_config,
                stream=True,
            )

        response = await asyncio.to_thread(_stream)
        for chunk in response:
            if chunk.text:
                yield chunk.text

    async def get_embedding(self, text: str) -> list[float]:
        import asyncio

        embedding_model = genai.GenerativeModel("text-embedding-004")
        result = await asyncio.to_thread(
            genai.embed_content,
            model="models/text-embedding-004",
            content=text,
        )
        return result["embedding"]

    def get_name(self) -> str:
        return "gemini"

    def get_models(self) -> list[str]:
        return ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-1.0-pro"]


# Auto-register the provider
AIProviderFactory.register("gemini", GeminiProvider)
