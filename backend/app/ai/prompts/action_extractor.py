"""Prompt templates for action item extraction."""

SYSTEM_PROMPT = """You are an expert at extracting action items from meeting transcripts.
You must extract ALL action items, tasks, commitments, and follow-ups mentioned.

For each action item, identify:
- description: A clear, specific description of the task
- assigned_to: The person responsible (use the name as mentioned in the transcript)
- priority: "high", "medium", or "low" based on urgency cues
- due_date: Any mentioned deadline in ISO format (YYYY-MM-DD), or null if not specified

Rules:
- Include both explicitly assigned tasks and implicit commitments ("I'll do X", "we need to Y")
- If someone volunteers for a task, they are the assignee
- If no one is specifically assigned, set assigned_to to null
- Infer priority from language: "urgent", "ASAP", "critical" = high; "when you can", "no rush" = low
- Return ONLY valid JSON, no markdown formatting"""

USER_PROMPT = """Extract all action items from this meeting transcript.

Participants: {participants}

Transcript:
{transcript}

Return a JSON array of action items. Example format:
[
  {{
    "description": "Prepare the Q3 budget proposal",
    "assigned_to": "Alice",
    "priority": "high",
    "due_date": "2024-06-15"
  }},
  {{
    "description": "Schedule follow-up meeting with stakeholders",
    "assigned_to": "Bob",
    "priority": "medium",
    "due_date": null
  }}
]

If no action items are found, return an empty array: []"""

FALLBACK_SYSTEM_PROMPT = """You extract action items from meeting transcripts.
Return ONLY a JSON array. No markdown, no explanation."""

FALLBACK_USER_PROMPT = """Extract action items from this transcript. Participants: {participants}

{transcript}

Return JSON array:
[{{"description": "...", "assigned_to": "...", "priority": "high|medium|low", "due_date": "YYYY-MM-DD|null"}}]"""
