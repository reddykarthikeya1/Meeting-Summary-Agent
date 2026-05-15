"""Summarizer agent for generating meeting summaries."""
import json
from app.ai.base import AIProvider
from app.ai.prompts.summarizer import SUMMARY_PROMPTS


class SummarizerAgent:
    """Agent that generates meeting summaries using an AI provider."""

    def __init__(self, provider: AIProvider):
        self.provider = provider

    async def summarize(
        self,
        transcript: str,
        summary_type: str = "brief",
        meeting_context: dict | None = None,
    ) -> str:
        """Generate a summary of the meeting transcript.

        Args:
            transcript: The full meeting transcript text.
            summary_type: Type of summary - "brief", "detailed", "executive", or "bullet_points".
            meeting_context: Optional dict with meeting metadata (title, date, participants, etc.)

        Returns:
            Generated summary text.
        """
        if summary_type not in SUMMARY_PROMPTS:
            summary_type = "brief"

        prompts = SUMMARY_PROMPTS[summary_type]
        context_str = self._format_context(meeting_context)

        user_prompt = prompts["user"].format(
            transcript=transcript,
            context=context_str,
        )

        summary = await self.provider.generate_text(
            prompt=user_prompt,
            system_prompt=prompts["system"],
            max_tokens=4096,
            temperature=0.3,
        )

        return summary

    async def summarize_stream(
        self,
        transcript: str,
        summary_type: str = "brief",
        meeting_context: dict | None = None,
    ):
        """Stream a summary generation."""
        if summary_type not in SUMMARY_PROMPTS:
            summary_type = "brief"

        prompts = SUMMARY_PROMPTS[summary_type]
        context_str = self._format_context(meeting_context)

        user_prompt = prompts["user"].format(
            transcript=transcript,
            context=context_str,
        )

        async for chunk in self.provider.generate_stream(
            prompt=user_prompt,
            system_prompt=prompts["system"],
            max_tokens=4096,
            temperature=0.3,
        ):
            yield chunk

    @staticmethod
    def _format_context(context: dict | None) -> str:
        """Format meeting context into a readable string."""
        if not context:
            return "No additional context provided."

        parts = []
        if context.get("title"):
            parts.append(f"Meeting: {context['title']}")
        if context.get("date"):
            parts.append(f"Date: {context['date']}")
        if context.get("participants"):
            parts.append(f"Participants: {', '.join(context['participants'])}")
        if context.get("meeting_type"):
            parts.append(f"Type: {context['meeting_type']}")

        return " | ".join(parts) if parts else "No additional context provided."
