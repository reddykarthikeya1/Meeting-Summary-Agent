export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const MEETING_TYPES = [
  { value: "standup", label: "Standup", color: "bg-emerald-500" },
  { value: "one_on_one", label: "1:1", color: "bg-blue-500" },
  { value: "project_review", label: "Project Review", color: "bg-violet-500" },
  { value: "brainstorm", label: "Brainstorm", color: "bg-amber-500" },
  { value: "interview", label: "Interview", color: "bg-rose-500" },
  { value: "client_call", label: "Client Call", color: "bg-cyan-500" },
  { value: "custom", label: "Custom", color: "bg-zinc-500" },
] as const;

export const PRIORITY_COLORS = {
  low: "bg-zinc-500/10 text-zinc-500",
  medium: "bg-blue-500/10 text-blue-500",
  high: "bg-amber-500/10 text-amber-500",
  urgent: "bg-red-500/10 text-red-500",
} as const;

export const STATUS_COLORS = {
  scheduled: "bg-zinc-500/10 text-zinc-500",
  recording: "bg-red-500/10 text-red-500",
  processing: "bg-amber-500/10 text-amber-500",
  completed: "bg-emerald-500/10 text-emerald-500",
  failed: "bg-red-500/10 text-red-500",
} as const;

export const AI_PROVIDERS = [
  { id: "openai", name: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"] },
  { id: "anthropic", name: "Anthropic", models: ["claude-sonnet-4-20250514", "claude-3-haiku-20240307"] },
  { id: "gemini", name: "Google Gemini", models: ["gemini-pro", "gemini-pro-vision"] },
  { id: "mistral", name: "Mistral", models: ["mistral-large-latest", "mistral-medium"] },
] as const;
