"""Topic analysis agent for meeting transcripts."""
import json
import structlog
from app.ai.base import AIProvider
from app.ai.prompts.topic_analyzer import SYSTEM_PROMPT, USER_PROMPT

logger = structlog.get_logger()


class TopicAnalyzerAgent:
    """Agent that analyzes topics and themes in meeting transcripts."""

    def __init__(self, provider: AIProvider):
        self.provider = provider

    async def analyze(self, transcript: str) -> list[dict]:
        """Analyze topics in a meeting transcript.

        Args:
            transcript: The full meeting transcript text.

        Returns:
            List of topic dicts with keys:
            - name (str): Short topic name
            - relevance_score (float): 0.0 to 1.0
            - description (str): Brief description
        """
        # Truncate if needed
        max_chars = 80000
        if len(transcript) > max_chars:
            transcript = transcript[:max_chars] + "\n[Transcript truncated...]"

        user_prompt = USER_PROMPT.format(transcript=transcript)

        try:
            response = await self.provider.generate_text(
                prompt=user_prompt,
                system_prompt=SYSTEM_PROMPT,
                max_tokens=2048,
                temperature=0.2,
            )
            return self._parse_topics(response)
        except Exception as e:
            logger.error("Topic analysis failed", error=str(e))
            return []

    @staticmethod
    def _parse_topics(response: str) -> list[dict]:
        """Parse the AI response into a list of topic dicts."""
        response = response.strip()

        # Remove markdown code fences
        if response.startswith("```"):
            lines = response.split("\n")
            lines = lines[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            response = "\n".join(lines).strip()

        try:
            topics = json.loads(response)
            if not isinstance(topics, list):
                topics = [topics]
        except json.JSONDecodeError:
            start = response.find("[")
            end = response.rfind("]")
            if start != -1 and end != -1:
                try:
                    topics = json.loads(response[start : end + 1])
                except json.JSONDecodeError:
                    logger.error("Failed to parse topics JSON", response=response[:500])
                    return []
            else:
                logger.error("No JSON array found in topic response", response=response[:500])
                return []

        normalized = []
        for topic in topics:
            if not isinstance(topic, dict):
                continue
            name = topic.get("name", "").strip()
            if not name:
                continue
            normalized.append(
                {
                    "name": name,
                    "relevance_score": min(1.0, max(0.0, float(topic.get("relevance_score", 0.5)))),
                    "description": topic.get("description", ""),
                }
            )

        # Sort by relevance
        normalized.sort(key=lambda x: x["relevance_score"], reverse=True)
        return normalized
