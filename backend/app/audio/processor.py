"""Audio file processing utilities."""
import os
import structlog
from pathlib import Path
from fastapi import UploadFile

logger = structlog.get_logger()

# Supported audio formats
SUPPORTED_FORMATS = {".mp3", ".wav", ".m4a", ".ogg", ".flac", ".webm", ".mp4", ".mpeg", ".mpga"}
MAX_FILE_SIZE_MB = 100
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


class AudioValidationError(Exception):
    """Raised when audio file validation fails."""
    pass


async def validate_audio_file(file: UploadFile) -> None:
    """Validate an uploaded audio file.

    Args:
        file: The uploaded file from FastAPI.

    Raises:
        AudioValidationError: If the file is invalid.
    """
    if not file.filename:
        raise AudioValidationError("No filename provided.")

    # Check file extension
    ext = Path(file.filename).suffix.lower()
    if ext not in SUPPORTED_FORMATS:
        raise AudioValidationError(
            f"Unsupported audio format: {ext}. "
            f"Supported formats: {', '.join(sorted(SUPPORTED_FORMATS))}"
        )

    # Check content type
    if file.content_type and not file.content_type.startswith("audio/"):
        # Allow some common content types that might be used for audio
        allowed_types = {
            "audio/mpeg", "audio/wav", "audio/mp4", "audio/ogg",
            "audio/flac", "audio/webm", "audio/x-m4a", "application/octet-stream",
        }
        if file.content_type not in allowed_types:
            logger.warning(
                "Unexpected content type for audio file",
                content_type=file.content_type,
                filename=file.filename,
            )

    # Check file size by reading the file
    content = await file.read()
    file_size = len(content)

    if file_size == 0:
        raise AudioValidationError("Uploaded file is empty.")

    if file_size > MAX_FILE_SIZE_BYTES:
        raise AudioValidationError(
            f"File size ({file_size / 1024 / 1024:.1f}MB) exceeds maximum "
            f"allowed size ({MAX_FILE_SIZE_MB}MB)."
        )

    # Reset file position for subsequent reads
    await file.seek(0)


async def save_audio_file(
    file: UploadFile,
    upload_dir: str,
    meeting_id: str,
) -> str:
    """Save an uploaded audio file to disk.

    Args:
        file: The uploaded file.
        upload_dir: Base upload directory.
        meeting_id: Meeting ID to use in the file path.

    Returns:
        The relative path where the file was saved.
    """
    os.makedirs(upload_dir, exist_ok=True)

    ext = Path(file.filename).suffix.lower() if file.filename else ".mp3"
    filename = f"{meeting_id}{ext}"
    file_path = os.path.join(upload_dir, filename)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    await file.seek(0)

    logger.info("Audio file saved", path=file_path, size=len(content))
    return file_path


def get_audio_metadata(file_path: str) -> dict:
    """Get metadata from an audio file using pydub.

    Args:
        file_path: Path to the audio file.

    Returns:
        Dict with metadata: duration_seconds, channels, sample_rate, format.
    """
    try:
        from pydub import AudioSegment

        audio = AudioSegment.from_file(file_path)

        return {
            "duration_seconds": len(audio) / 1000.0,
            "channels": audio.channels,
            "sample_rate": audio.frame_rate,
            "sample_width": audio.sample_width,
            "format": Path(file_path).suffix.lstrip("."),
            "file_size_bytes": os.path.getsize(file_path),
        }
    except Exception as e:
        logger.error("Failed to get audio metadata", path=file_path, error=str(e))
        return {
            "duration_seconds": 0,
            "channels": 0,
            "sample_rate": 0,
            "format": Path(file_path).suffix.lstrip("."),
            "file_size_bytes": os.path.getsize(file_path) if os.path.exists(file_path) else 0,
            "error": str(e),
        }


def convert_audio_format(
    input_path: str,
    output_format: str = "mp3",
    output_dir: str | None = None,
) -> str:
    """Convert an audio file to a different format.

    Args:
        input_path: Path to the input audio file.
        output_format: Desired output format (e.g., "mp3", "wav").
        output_dir: Directory for the output file. Defaults to same directory.

    Returns:
        Path to the converted file.
    """
    from pydub import AudioSegment

    audio = AudioSegment.from_file(input_path)

    if output_dir is None:
        output_dir = os.path.dirname(input_path)

    base_name = Path(input_path).stem
    output_path = os.path.join(output_dir, f"{base_name}.{output_format}")

    audio.export(output_path, format=output_format)
    logger.info("Audio converted", input=input_path, output=output_path, format=output_format)

    return output_path
