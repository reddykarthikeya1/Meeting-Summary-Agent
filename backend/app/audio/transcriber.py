"""Audio transcription interfaces and implementations."""
import os
import structlog
from abc import ABC, abstractmethod
from pathlib import Path

logger = structlog.get_logger()


class TranscriptionResult:
    """Result from a transcription operation."""

    def __init__(
        self,
        text: str,
        segments: list[dict] | None = None,
        language: str | None = None,
        duration: float | None = None,
    ):
        self.text = text
        self.segments = segments or []
        self.language = language
        self.duration = duration

    def to_dict(self) -> dict:
        return {
            "text": self.text,
            "segments": self.segments,
            "language": self.language,
            "duration": self.duration,
        }


class TranscriberInterface(ABC):
    """Abstract interface for audio transcription services."""

    @abstractmethod
    async def transcribe(self, file_path: str, language: str | None = None) -> TranscriptionResult:
        """Transcribe an audio file.

        Args:
            file_path: Path to the audio file.
            language: Optional language code (e.g., "en").

        Returns:
            TranscriptionResult with text and segments.
        """
        ...

    @abstractmethod
    def get_name(self) -> str:
        """Return the transcriber name."""
        ...


class WhisperTranscriber(TranscriberInterface):
    """Transcriber using OpenAI's Whisper API."""

    def __init__(self, api_key: str | None = None):
        from openai import AsyncOpenAI
        from app.config import settings

        resolved_key = api_key or settings.OPENAI_API_KEY
        self.client = AsyncOpenAI(api_key=resolved_key)
        self.model = "whisper-1"

    async def transcribe(self, file_path: str, language: str | None = None) -> TranscriptionResult:
        """Transcribe audio using OpenAI Whisper.

        Args:
            file_path: Path to the audio file.
            language: Optional ISO language code.

        Returns:
            TranscriptionResult with full text and timestamped segments.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Audio file not found: {file_path}")

        file_size = os.path.getsize(file_path)
        logger.info("Starting transcription", file=file_path, size_mb=file_size / 1024 / 1024)

        # Use verbose_json to get segment-level timestamps
        with open(file_path, "rb") as audio_file:
            kwargs = {
                "model": self.model,
                "file": audio_file,
                "response_format": "verbose_json",
                "timestamp_granularities": ["segment"],
            }
            if language:
                kwargs["language"] = language

            response = await self.client.audio.transcriptions.create(**kwargs)

        # Parse segments
        segments = []
        if hasattr(response, "segments") and response.segments:
            for seg in response.segments:
                segments.append(
                    {
                        "start": seg.get("start", 0.0),
                        "end": seg.get("end", 0.0),
                        "text": seg.get("text", "").strip(),
                        "confidence": seg.get("avg_logprob"),
                    }
                )

        result = TranscriptionResult(
            text=response.text if hasattr(response, "text") else "",
            segments=segments,
            language=getattr(response, "language", None),
            duration=getattr(response, "duration", None),
        )

        logger.info(
            "Transcription completed",
            text_length=len(result.text),
            segment_count=len(segments),
            language=result.language,
        )

        return result

    def get_name(self) -> str:
        return "openai_whisper"


class TranscriberFactory:
    """Factory for creating transcriber instances."""

    _transcribers: dict[str, type[TranscriberInterface]] = {
        "openai": WhisperTranscriber,
    }

    @classmethod
    def register(cls, name: str, transcriber_class: type[TranscriberInterface]) -> None:
        cls._transcribers[name] = transcriber_class

    @classmethod
    def create(cls, name: str, **kwargs) -> TranscriberInterface:
        if name not in cls._transcribers:
            raise ValueError(f"Unknown transcriber: {name}. Available: {list(cls._transcribers.keys())}")
        return cls._transcribers[name](**kwargs)

    @classmethod
    def get_default(cls) -> TranscriberInterface:
        return WhisperTranscriber()
