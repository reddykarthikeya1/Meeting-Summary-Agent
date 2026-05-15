# MeetAI — AI Meeting & Notes Assistant

Record, transcribe, summarize, and extract action items from your meetings using AI. Supports multiple AI providers and integrates with Microsoft Teams.

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
- **Multi-Provider Support** — Choose from OpenAI (GPT-4o), Anthropic (Claude), Google Gemini, or Mistral for each meeting

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
| AI Providers | OpenAI, Anthropic, Google Gemini, Mistral |
| Speech-to-Text | OpenAI Whisper |
| Teams Integration | Microsoft Graph API |
| Deployment | Docker, Docker Compose |

---

## Project Structure

```
meeting-ai/
├── docker-compose.yml          # Root compose (all services)
├── frontend/                   # Next.js 14 App Router
│   ├── src/
│   │   ├── app/                # Pages (landing, auth, dashboard)
│   │   ├── components/         # UI, layout, meeting, recording components
│   │   ├── lib/                # Utils, types, constants, API client
│   │   └── store/              # Zustand stores
│   └── Dockerfile
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── ai/                 # AI providers, agents, prompts
│   │   ├── api/v1/             # REST API endpoints
│   │   ├── audio/              # Audio processing & transcription
│   │   ├── core/               # Security, exceptions
│   │   ├── db/                 # Database session
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── services/           # Business logic
│   │   ├── tasks/              # Celery background tasks
│   │   └── teams/              # Microsoft Teams bot
│   ├── Dockerfile
│   └── docker-compose.yml      # Backend-only compose
└── README.md
```

---

## Getting Started

### Prerequisites

- Docker & Docker Compose (recommended)
- Or: Node.js 20+, Python 3.11+, PostgreSQL, Redis

### Quick Start with Docker

```bash
git clone https://github.com/reddykarthikeya1/Meeting-Summary-Agent.git
cd Meeting-Summary-Agent
docker-compose up -d
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

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

**Database:**
```bash
# Create PostgreSQL database
createdb meetai

# Run migrations
cd backend
alembic upgrade head
```

---

## Environment Variables

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/meetai
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key

# AI Providers (configure at least one)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...
MISTRAL_API_KEY=...

# Microsoft Teams (optional)
TEAMS_TENANT_ID=...
TEAMS_CLIENT_ID=...
TEAMS_CLIENT_SECRET=...
```

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
| POST | `/api/v1/teams/webhook` | Teams bot webhook |

Full API documentation available at http://localhost:8000/docs (Swagger UI).

---

## Teams Bot Commands

Add the MeetAI bot to any Teams channel and use these commands:

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

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with features and CTA |
| `/login` | User login |
| `/register` | User registration |
| `/` | Dashboard with stats, recent meetings, charts |
| `/meetings` | Meeting list with filters and grid/list view |
| `/meetings/new` | Record or upload a new meeting |
| `/meetings/[id]` | Meeting detail with Summary, Transcript, Action Items, Notes, Comments tabs |
| `/action-items` | Kanban board for all action items |
| `/search` | Full-text search across all meetings |
| `/templates` | Meeting template library |
| `/analytics` | Charts and statistics |
| `/settings` | Profile, AI Providers, Team, Integrations |
| `/live/[id]` | Real-time meeting recording view |

---

## License

MIT
