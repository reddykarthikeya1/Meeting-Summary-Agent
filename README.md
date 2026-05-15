# MeetAI — AI Meeting & Notes Assistant

Record, transcribe, summarize, and extract action items from your meetings using AI. Supports 11 AI providers and integrates with Microsoft Teams.

---

## Features

### Meeting Management
- **Live Recording** — Record meetings directly in the browser with real-time waveform visualization
- **Audio Upload** — Upload existing recordings (MP3, MP4, WAV, M4A, WebM)
- **Speaker Diarization** — Automatic speaker identification and labeling
- **Meeting Templates** — Pre-built templates for Standup, 1:1, Project Review, Brainstorm, Interview, and Client Call

### AI-Powered Intelligence
- **Smart Transcription** — Accurate speech-to-text with timestamps and confidence scores
- **Meeting Summaries** — Generate brief, detailed, executive, or bullet-point summaries
- **Action Item Extraction** — AI automatically identifies tasks, assigns owners, and detects priorities
- **Topic Analysis** — Extract key topics and themes discussed in meetings
- **Smart Chunking** — Long transcripts are automatically split for models with small context windows
- **Multi-Provider Support** — Choose from 11 AI providers for each meeting

### Multi-Provider AI Chat
- **Chat Interface** — Full-featured chat with any configured AI provider
- **Provider Switching** — Switch between providers and models mid-conversation
- **Session Management** — Create, switch, and delete chat sessions
- **System Prompts** — Preset prompts for Meeting Analyst, Code Assistant, Writing Assistant, Data Analyst
- **Conversation Context** — Paste meeting transcripts as context for informed responses

### AI Playground
- **Text Analysis** — Paste transcripts and run summarization, action extraction, or topic analysis
- **Live Recording** — Record meetings with real-time waveform and auto-summary on stop
- **Conversation Mode** — Chat with AI about a meeting transcript
- **Quick Actions** — One-click summarize, extract actions, or analyze topics

### Collaboration
- **Comments & Threads** — Add timestamped comments on any part of the transcript
- **Sharing** — Share meetings with team members via link or direct invite
- **Export** — Export meetings as PDF, Markdown, or JSON
- **Follow-up Reminders** — Automatic reminders for upcoming action item deadlines

### Microsoft Teams Integration
- **Teams Bot** — Add the MeetAI bot to any Teams channel
- **Note Capture** — Use `/startnotes` and `/stopnotes` to capture channel messages as meeting notes
- **Meeting Sync** — Sync Teams meeting recordings and transcripts directly to MeetAI
- **Commands** — `/summarize`, `/actionitems`, `/link`, `/status`, `/help`

### Search & Analytics
- **Full-Text Search** — Search across all meetings, transcripts, summaries, and action items
- **Analytics Dashboard** — Meeting frequency, speaker statistics, topic trends, action item completion rates
- **Kanban Board** — Manage action items in a drag-and-drop Kanban view

### Setup & Configuration
- **Setup Wizard** — 3-step wizard for database, AI providers, and admin account on first launch
- **Provider Configuration** — Add API keys, test connections, set defaults for all 11 providers
- **Self-Hosted Support** — Configure local models (Qwen via vLLM/Ollama) with custom base URLs

---

## Supported AI Providers

| Provider | Type | Models |
|----------|------|--------|
| OpenAI | Cloud | GPT-4o, GPT-4o-mini, GPT-4-turbo |
| Anthropic | Cloud | Claude Sonnet 4, Claude 3 Haiku |
| Google Gemini | Cloud | Gemini Pro, Gemini 1.5 Flash |
| Groq | Cloud | Llama 3.3 70B, Mixtral 8x7B, Gemma 2 |
| OpenRouter | Cloud | 100+ models via single API |
| Mistral | Cloud | Mistral Large, Medium, Small |
| Together AI | Cloud | Llama 3.1 70B, Mixtral |
| Fireworks AI | Cloud | Llama 3.1 70B |
| DeepSeek | Cloud | DeepSeek Chat, Coder |
| Qwen | Self-Hosted | Qwen3 30B A3B, 235B, 32B, 14B, 8B |
| Custom | Self-Hosted | Any OpenAI-compatible endpoint |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| UI Components | shadcn/ui (Radix UI primitives) |
| State Management | Zustand |
| Charts | Recharts |
| Backend | Python 3.11, FastAPI, SQLAlchemy 2.0 (async) |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7, Celery |
| Auth | JWT (python-jose), bcrypt |
| AI Providers | OpenAI, Anthropic, Gemini, Groq, OpenRouter, Mistral, Together, Fireworks, DeepSeek, Qwen, Custom |
| Speech-to-Text | OpenAI Whisper |
| Teams Integration | Microsoft Graph API |
| Deployment | Docker, Docker Compose |

---

## Getting Started

### Prerequisites

- Docker & Docker Compose (recommended)
- Or: Node.js 20+, Python 3.11+, PostgreSQL, Redis

### Quick Start with Docker

```bash
git clone https://github.com/reddykarthikeya1/Meeting-Summary-Agent.git
cd Meeting-Summary-Agent
docker-compose up --build -d
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Setup Wizard: http://localhost:3000/setup

### Default Credentials

- Email: `admin@meetai.com`
- Password: `Meetai@2026`

### Manual Setup

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/meetai
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key

# Cloud AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
GROQ_API_KEY=gsk_...
OPENROUTER_API_KEY=sk-or-...
MISTRAL_API_KEY=...
TOGETHER_API_KEY=...
FIREWORKS_API_KEY=...
DEEPSEEK_API_KEY=...

# Self-Hosted / Local
QWEN_BASE_URL=http://localhost:11434/v1
QWEN_MODEL=qwen3-30b-a3b

# Custom OpenAI-Compatible
CUSTOM_BASE_URL=
CUSTOM_MODEL=

# Microsoft Teams (optional)
TEAMS_TENANT_ID=...
TEAMS_CLIENT_ID=...
TEAMS_CLIENT_SECRET=...
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with features and CTA |
| `/login` | User login |
| `/register` | User registration |
| `/setup` | First-time setup wizard |
| `/dashboard` | Dashboard with stats, recent meetings, charts |
| `/dashboard/meetings` | Meeting list with filters and grid/list view |
| `/dashboard/meetings/new` | Record or upload a new meeting |
| `/dashboard/meetings/[id]` | Meeting detail with Summary, Transcript, Action Items, Notes, Comments |
| `/dashboard/action-items` | Kanban board for all action items |
| `/dashboard/search` | Full-text search across all meetings |
| `/dashboard/templates` | Meeting template library |
| `/dashboard/analytics` | Charts and statistics |
| `/dashboard/settings` | Profile, AI Providers, Team, Integrations |
| `/dashboard/live/[id]` | Real-time meeting recording view |
| `/dashboard/playground` | AI playground with 4 modes |
| `/dashboard/chat` | Multi-provider AI chat |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login (returns JWT) |
| GET | `/api/v1/meetings` | List meetings (paginated, filtered) |
| POST | `/api/v1/meetings` | Create meeting |
| GET | `/api/v1/meetings/{id}` | Get meeting detail |
| POST | `/api/v1/meetings/{id}/upload` | Upload audio file |
| POST | `/api/v1/meetings/{id}/transcribe` | Start transcription |
| POST | `/api/v1/meetings/{id}/summaries` | Generate AI summary |
| POST | `/api/v1/meetings/{id}/action-items/extract` | Extract action items with AI |
| GET | `/api/v1/action-items` | List all action items |
| GET | `/api/v1/search?q=...` | Search across all meetings |
| GET | `/api/v1/analytics/overview` | Dashboard analytics |
| POST | `/api/v1/chat` | Multi-provider chat |
| POST | `/api/v1/meetings/playground/summarize` | Playground summarization |
| POST | `/api/v1/meetings/playground/extract-actions` | Playground action extraction |
| POST | `/api/v1/meetings/playground/analyze-topics` | Playground topic analysis |
| GET | `/api/v1/providers` | List AI providers |
| POST | `/api/v1/providers/test` | Test provider connection |
| POST | `/api/v1/providers/configure` | Save provider config |
| POST | `/api/v1/setup/configure` | Initial setup |
| POST | `/api/v1/teams/webhook` | Teams bot webhook |

Full API documentation available at http://localhost:8000/docs (Swagger UI).

---

## Teams Bot Commands

| Command | Description |
|---------|-------------|
| `/startnotes` | Start capturing channel messages as meeting notes |
| `/stopnotes` | Stop capturing and save notes |
| `/summarize` | Generate AI summary of captured notes |
| `/actionitems` | Extract action items from captured notes |
| `/link` | Get link to the meeting in MeetAI dashboard |
| `/status` | Check current meeting sync status |
| `/help` | Show available commands |

---

## License

MIT
