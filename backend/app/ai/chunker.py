"""
Text chunking for AI processing.
Splits long transcripts into manageable chunks for models with small context windows.
Handles overlap to maintain context across chunks.
"""
from dataclasses import dataclass


@dataclass
class Chunk:
    text: str
    index: int
    start_offset: int
    end_offset: int


def estimate_tokens(text: str) -> int:
    """Rough token estimate: ~4 chars per token for English."""
    return len(text) // 4


def chunk_text(
    text: str,
    max_tokens: int = 3000,
    overlap_tokens: int = 200,
) -> list[Chunk]:
    """
    Split text into chunks that fit within a token limit.
    Tries to split at sentence boundaries. Includes overlap for context continuity.
    """
    max_chars = max_tokens * 4
    overlap_chars = overlap_tokens * 4

    if len(text) <= max_chars:
        return [Chunk(text=text, index=0, start_offset=0, end_offset=len(text))]

    # Split into sentences first
    sentences = _split_sentences(text)
    chunks = []
    current_text = ""
    current_start = 0
    offset = 0

    for sentence in sentences:
        if len(current_text) + len(sentence) > max_chars and current_text:
            chunks.append(Chunk(
                text=current_text.strip(),
                index=len(chunks),
                start_offset=current_start,
                end_offset=offset,
            ))
            # Keep overlap from end of current chunk
            overlap_text = current_text[-overlap_chars:] if len(current_text) > overlap_chars else current_text
            current_text = overlap_text + sentence
            current_start = offset - len(overlap_text)
        else:
            current_text += sentence
        offset += len(sentence)

    if current_text.strip():
        chunks.append(Chunk(
            text=current_text.strip(),
            index=len(chunks),
            start_offset=current_start,
            end_offset=offset,
        ))

    return chunks


def _split_sentences(text: str) -> list[str]:
    """Split text into sentences, preserving punctuation."""
    import re
    # Split on sentence boundaries but keep the delimiter
    parts = re.split(r'(?<=[.!?])\s+', text)
    sentences = []
    for part in parts:
        if part.strip():
            sentences.append(part + " ")
    return sentences if sentences else [text]


def chunk_transcript_segments(
    segments: list[dict],
    max_tokens: int = 3000,
    overlap_tokens: int = 200,
) -> list[list[dict]]:
    """
    Group transcript segments into chunks that fit within token limits.
    Each chunk is a list of segment dicts with 'text', 'speaker', 'start_time', etc.
    """
    chunks = []
    current_chunk = []
    current_tokens = 0

    for segment in segments:
        seg_tokens = estimate_tokens(segment.get("text", ""))

        if current_tokens + seg_tokens > max_tokens and current_chunk:
            chunks.append(current_chunk)
            # Keep last few segments as overlap
            overlap_segs = []
            overlap_count = 0
            for seg in reversed(current_chunk):
                overlap_count += estimate_tokens(seg.get("text", ""))
                if overlap_count > overlap_tokens:
                    break
                overlap_segs.insert(0, seg)
            current_chunk = overlap_segs
            current_tokens = sum(estimate_tokens(s.get("text", "")) for s in current_chunk)

        current_chunk.append(segment)
        current_tokens += seg_tokens

    if current_chunk:
        chunks.append(current_chunk)

    return chunks


def merge_chunk_results(results: list[str], separator: str = "\n\n") -> str:
    """Merge results from multiple chunk processing runs."""
    return separator.join(r.strip() for r in results if r.strip())
