"""Action item extraction agent."""
import json
import structlog
from app.ai.base import AIProvider
from app.ai.prompts.action_extractor import SYSTEM_PROMPT, USER_PROMPT, FALLBACK_SYSTEM_PROMPT, FALLBACK_USER_PROMPT

logger = structlog.get_logger()


class ActionExtractorAgent:
    """Agent that extracts action items from meeting transcripts."""

    def __init__(self, provider: AIProvider):
        self.provider = provider

    async def extract(
        self,
        transcript: str,
        participants: list[str] | None = None,
    ) -> list[dict]:
        """Extract action items from a meeting transcript.

        Args:
            transcript: The full meeting transcript text.
            participants: List of participant names.

        Returns:
            List of action item dicts with keys:
            - description (str)
            - assigned_to (str | None)
            - priority (str: "high", "medium", "low")
            - due_date (str | None): ISO date string
        """
        participants_str = ", ".join(participants) if participants else "Unknown participants"

        # Truncate transcript if too long for context window
        max_transcript_chars = 80000
        if len(transcript) > max_transcript_chars:
            transcript = transcript[:max_transcript_chars] + "\n[Transcript truncated...]"

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
