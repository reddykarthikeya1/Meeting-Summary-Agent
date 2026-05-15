"""Prompt templates for meeting summarization."""

BRIEF_SYSTEM_PROMPT = """You are an expert meeting summarizer. Create concise, actionable meeting summaries.
Focus on key decisions, outcomes, and next steps. Keep it under 200 words."""

BRIEF_USER_PROMPT = """Summarize the following meeting transcript in a brief format:

{transcript}

Meeting context: {context}

Provide a brief summary covering:
1. Main topics discussed
2. Key decisions made
3. Next steps"""

DETAILED_SYSTEM_PROMPT = """You are an expert meeting summarizer. Create comprehensive, well-structured meeting summaries.
Include all important details, discussions, decisions, and action items."""

DETAILED_USER_PROMPT = """Create a detailed summary of the following meeting transcript:

{transcript}

Meeting context: {context}

Structure the summary with these sections:
## Overview
Brief description of the meeting purpose and outcome.

## Key Discussions
Summarize each major topic discussed, including different viewpoints.

## Decisions Made
List all decisions with rationale.

## Action Items
List all action items with owners and deadlines if mentioned.

## Open Questions
Any unresolved items or questions raised."""

EXECUTIVE_SYSTEM_PROMPT = """You are an executive assistant specializing in meeting summaries for leadership.
Create high-level summaries that focus on strategic impact, decisions, and blockers."""

EXECUTIVE_USER_PROMPT = """Create an executive summary of the following meeting:

{transcript}

Meeting context: {context}

Format:
## Executive Summary (2-3 sentences)

## Strategic Decisions
High-impact decisions made.

## Blockers & Risks
Issues that need leadership attention.

## Resource Needs
Any budget, personnel, or resource requests.

## Next Steps
Critical follow-up actions."""

BULLET_POINTS_SYSTEM_PROMPT = """You are a meeting note-taker. Extract key points as concise bullet points.
Each bullet should be a single, clear statement."""

BULLET_POINTS_USER_PROMPT = """Extract the key points from this meeting transcript as bullet points:

{transcript}

Meeting context: {context}

Organize bullets under these headers:
- **Topics Covered**
- **Decisions**
- **Action Items**
- **Key Takeaways**"""

SUMMARY_PROMPTS = {
    "brief": {"system": BRIEF_SYSTEM_PROMPT, "user": BRIEF_USER_PROMPT},
    "detailed": {"system": DETAILED_SYSTEM_PROMPT, "user": DETAILED_USER_PROMPT},
    "executive": {"system": EXECUTIVE_SYSTEM_PROMPT, "user": EXECUTIVE_USER_PROMPT},
    "bullet_points": {"system": BULLET_POINTS_SYSTEM_PROMPT, "user": BULLET_POINTS_USER_PROMPT},
}
