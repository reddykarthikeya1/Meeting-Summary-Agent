"""Prompt templates for topic analysis."""

SYSTEM_PROMPT = """You are an expert at analyzing meeting transcripts to identify key topics and themes.
For each topic, provide:
- name: A short, descriptive topic name (2-5 words)
- relevance_score: A float between 0.0 and 1.0 indicating how central this topic was
- description: A brief description of what was discussed under this topic

Rules:
- Identify 3-10 main topics
- Order by relevance (most important first)
- Use clear, professional topic names
- Return ONLY valid JSON"""

USER_PROMPT = """Analyze the following meeting transcript and identify the main topics discussed.

Transcript:
{transcript}

Return a JSON array of topics. Example format:
[
  {{
    "name": "Q3 Budget Planning",
    "relevance_score": 0.95,
    "description": "Discussion of quarterly budget allocations and cost reduction strategies"
  }},
  {{
    "name": "Product Launch Timeline",
    "relevance_score": 0.8,
    "description": "Review of upcoming product launch milestones and dependencies"
  }}
]"""

SENTIMENT_SYSTEM_PROMPT = """You analyze the overall sentiment and tone of meeting transcripts.
Provide:
- overall_sentiment: "positive", "neutral", or "negative"
- engagement_level: "high", "medium", or "low"
- key_sentiment_drivers: List of factors influencing the sentiment"""

SENTIMENT_USER_PROMPT = """Analyze the sentiment and engagement of this meeting:

{transcript}

Return JSON:
{{
  "overall_sentiment": "positive|neutral|negative",
  "engagement_level": "high|medium|low",
  "key_sentiment_drivers": ["reason1", "reason2"]
}}"""
