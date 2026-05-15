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
  { id: "openai", name: "OpenAI", models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"], requiresKey: true, keyUrl: "https://platform.openai.com/api-keys" },
  { id: "anthropic", name: "Anthropic", models: ["claude-sonnet-4-20250514", "claude-3-haiku-20240307"], requiresKey: true, keyUrl: "https://console.anthropic.com/" },
  { id: "gemini", name: "Google Gemini", models: ["gemini-pro", "gemini-pro-vision", "gemini-1.5-flash"], requiresKey: true, keyUrl: "https://aistudio.google.com/app/apikey" },
  { id: "groq", name: "Groq", models: ["llama-3.3-70b-versatile", "mixtral-8x7b-32768", "gemma2-9b-it"], requiresKey: true, keyUrl: "https://console.groq.com/keys" },
  { id: "openrouter", name: "OpenRouter", models: ["anthropic/claude-sonnet-4-20250514", "meta-llama/llama-3.1-70b-instruct"], requiresKey: true, keyUrl: "https://openrouter.ai/keys" },
  { id: "mistral", name: "Mistral", models: ["mistral-large-latest", "mistral-medium", "mistral-small-latest"], requiresKey: true, keyUrl: "https://console.mistral.ai/" },
  { id: "together", name: "Together AI", models: ["meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo"], requiresKey: true, keyUrl: "https://api.together.xyz/settings/api-keys" },
  { id: "fireworks", name: "Fireworks AI", models: ["accounts/fireworks/models/llama-v3p1-70b-instruct"], requiresKey: true, keyUrl: "https://fireworks.ai/account/api-keys" },
  { id: "deepseek", name: "DeepSeek", models: ["deepseek-chat", "deepseek-coder"], requiresKey: true, keyUrl: "https://platform.deepseek.com/api_keys" },
  { id: "qwen", name: "Qwen (Self-Hosted)", models: ["qwen3-30b-a3b", "qwen3-235b-a22b", "qwen3-32b", "qwen3-14b", "qwen3-8b"], requiresKey: false },
  { id: "custom", name: "Custom (OpenAI-Compatible)", models: [], requiresKey: false },
] as const;
