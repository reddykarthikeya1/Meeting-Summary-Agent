"""Summarizer agent for generating meeting summaries with chunking support."""
from app.ai.base import AIProvider
from app.ai.prompts.summarizer import SUMMARY_PROMPTS
from app.ai.chunker import chunk_text, estimate_tokens


# Max tokens we send to the model (leaving room for system prompt + output)
DEFAULT_MAX_INPUT_TOKENS = 3000


class SummarizerAgent:
    """Agent that generates meeting summaries using an AI provider.
    Handles long transcripts by chunking for models with small context windows.
    """

    def __init__(self, provider: AIProvider, max_input_tokens: int = DEFAULT_MAX_INPUT_TOKENS):
        self.provider = provider
        self.max_input_tokens = max_input_tokens

    async def summarize(
        self,
        transcript: str,
        summary_type: str = "brief",
        meeting_context: dict | None = None,
    ) -> str:
        """Generate a summary, chunking if the transcript is too long."""
        if summary_type not in SUMMARY_PROMPTS:
            summary_type = "brief"

        prompts = SUMMARY_PROMPTS[summary_type]
        context_str = self._format_context(meeting_context)

        # Check if we need to chunk
        transcript_tokens = estimate_tokens(transcript)

        if transcript_tokens <= self.max_input_tokens:
            # Fits in one call
            user_prompt = prompts["user"].format(transcript=transcript, context=context_str)
            return await self.provider.generate_text(
                prompt=user_prompt,
                system_prompt=prompts["system"],
                max_tokens=4096,
                temperature=0.3,
            )

        # Chunk the transcript and summarize each chunk, then combine
        chunks = chunk_text(transcript, max_tokens=self.max_input_tokens, overlap_tokens=200)
        chunk_summaries = []

        for chunk in chunks:
            user_prompt = prompts["user"].format(transcript=chunk.text, context=context_str)
            chunk_summary = await self.provider.generate_text(
                prompt=user_prompt,
                system_prompt=prompts["system"],
                max_tokens=2048,
                temperature=0.3,
            )
            chunk_summaries.append(chunk_summary)

        if len(chunk_summaries) == 1:
            return chunk_summaries[0]

        # Merge chunk summaries into a final summary
        combined = "\n\n".join(
            f"--- Part {i+1} ---\n{s}" for i, s in enumerate(chunk_summaries)
        )
        merge_prompt = (
            f"Below are summaries of different parts of a meeting. "
            f"Combine them into a single coherent {summary_type} summary.\n\n"
            f"{combined}"
        )
        final = await self.provider.generate_text(
            prompt=merge_prompt,
            system_prompt=prompts["system"],
            max_tokens=4096,
            temperature=0.3,
        )
        return final

    async def summarize_stream(
        self,
        transcript: str,
        summary_type: str = "brief",
        meeting_context: dict | None = None,
    ):
        """Stream a summary generation (single-chunk only for streaming)."""
        if summary_type not in SUMMARY_PROMPTS:
            summary_type = "brief"

        prompts = SUMMARY_PROMPTS[summary_type]
        context_str = self._format_context(meeting_context)

        # For streaming, truncate if too long (streaming is for real-time UX)
        transcript_tokens = estimate_tokens(transcript)
        if transcript_tokens > self.max_input_tokens:
            # Truncate to fit
            max_chars = self.max_input_tokens * 4
            transcript = transcript[:max_chars] + "\n...[truncated for streaming]"

        user_prompt = prompts["user"].format(transcript=transcript, context=context_str)

        async for chunk in self.provider.generate_stream(
            prompt=user_prompt,
            system_prompt=prompts["system"],
            max_tokens=4096,
            temperature=0.3,
        ):
            yield chunk

    @staticmethod
    def _format_context(context: dict | None) -> str:
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
