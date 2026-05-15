"""Action item extraction agent with chunking support."""
import json
import structlog
from app.ai.base import AIProvider
from app.ai.prompts.action_extractor import SYSTEM_PROMPT, USER_PROMPT, FALLBACK_SYSTEM_PROMPT, FALLBACK_USER_PROMPT
from app.ai.chunker import chunk_text, estimate_tokens

logger = structlog.get_logger()

DEFAULT_MAX_INPUT_TOKENS = 3000


class ActionExtractorAgent:
    """Agent that extracts action items from meeting transcripts.
    Handles long transcripts by chunking for models with small context windows.
    """

    def __init__(self, provider: AIProvider, max_input_tokens: int = DEFAULT_MAX_INPUT_TOKENS):
        self.provider = provider
        self.max_input_tokens = max_input_tokens

    async def extract(
        self,
        transcript: str,
        participants: list[str] | None = None,
    ) -> list[dict]:
        """Extract action items, chunking if the transcript is too long."""
        participants_str = ", ".join(participants) if participants else "Unknown participants"
        transcript_tokens = estimate_tokens(transcript)

        if transcript_tokens <= self.max_input_tokens:
            return await self._extract_single(transcript, participants_str)

        # Chunk and extract from each chunk
        chunks = chunk_text(transcript, max_tokens=self.max_input_tokens, overlap_tokens=200)
        all_items = []

        for chunk in chunks:
            items = await self._extract_single(chunk.text, participants_str)
            all_items.extend(items)

        # Deduplicate by description similarity
        return self._deduplicate(all_items)

    async def _extract_single(
        self,
        transcript: str,
        participants_str: str,
    ) -> list[dict]:
        """Extract action items from a single transcript chunk."""
        user_prompt = USER_PROMPT.format(
            participants=participants_str,
            transcript=transcript,
        )

        try:
            response = await self.provider.generate_text(
                prompt=user_prompt,
                system_prompt=SYSTEM_PROMPT,
                max_tokens=4096,
                temperature=0.1,
            )
            return self._parse_response(response)
        except Exception as e:
            logger.warning("Primary extraction failed, trying fallback", error=str(e))
            return await self._fallback_extract(transcript, participants_str)

    async def _fallback_extract(
        self,
        transcript: str,
        participants_str: str,
    ) -> list[dict]:
        """Fallback extraction with simpler prompt."""
        try:
            user_prompt = FALLBACK_USER_PROMPT.format(
                participants=participants_str,
                transcript=transcript[:40000],
            )
            response = await self.provider.generate_text(
                prompt=user_prompt,
                system_prompt=FALLBACK_SYSTEM_PROMPT,
                max_tokens=4096,
                temperature=0.0,
            )
            return self._parse_response(response)
        except Exception as e:
            logger.error("Fallback extraction also failed", error=str(e))
            return []

    @staticmethod
    def _deduplicate(items: list[dict]) -> list[dict]:
        """Remove duplicate action items based on description similarity."""
        seen = set()
        unique = []
        for item in items:
            desc = item.get("description", "").lower().strip()
            if not desc:
                continue
            # Simple dedup by first 50 chars
            key = desc[:50]
            if key not in seen:
                seen.add(key)
                unique.append(item)
        return unique

    @staticmethod
    def _parse_response(response: str) -> list[dict]:
        """Parse the AI response into a list of action item dicts."""
        # Try to extract JSON from the response
        response = response.strip()

        # Remove markdown code fences if present
        if response.startswith("```"):
            lines = response.split("\n")
            # Remove first line (```json or ```)
            lines = lines[1:]
            # Remove last line (```)
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            response = "\n".join(lines).strip()

        try:
            items = json.loads(response)
            if not isinstance(items, list):
                items = [items]
        except json.JSONDecodeError:
            # Try to find JSON array in the response
            start = response.find("[")
            end = response.rfind("]")
            if start != -1 and end != -1:
                try:
                    items = json.loads(response[start : end + 1])
                except json.JSONDecodeError:
                    logger.error("Failed to parse action items JSON", response=response[:500])
                    return []
            else:
                logger.error("No JSON array found in response", response=response[:500])
                return []

        # Normalize the items
        normalized = []
        for item in items:
            if not isinstance(item, dict):
                continue
            normalized.append(
                {
                    "description": item.get("description", "").strip(),
                    "assigned_to": item.get("assigned_to"),
                    "priority": _normalize_priority(item.get("priority", "medium")),
                    "due_date": item.get("due_date"),
                }
            )

        return [item for item in normalized if item["description"]]


def _normalize_priority(priority: str) -> str:
    """Normalize priority string to standard values."""
    priority = priority.lower().strip()
    if priority in ("high", "critical", "urgent"):
        return "high"
    elif priority in ("low", "minor", "no rush"):
        return "low"
    return "medium"
