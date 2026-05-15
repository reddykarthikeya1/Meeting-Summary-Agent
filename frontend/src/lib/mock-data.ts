import type {
  Meeting,
  Participant,
  TranscriptSegment,
  Summary,
  ActionItem,
  Comment,
  Template,
  Tag,
  AnalyticsOverview,
  SpeakerStats,
  User,
} from "./types";

// ── Users ──────────────────────────────────────────────────────────────────
export const currentUser: User = {
  id: "u1",
  email: "alex.johnson@meetai.io",
  name: "Alex Johnson",
  avatar_url: undefined,
  role: "admin",
  created_at: "2025-09-15T10:00:00Z",
};

export const users: User[] = [
  currentUser,
  { id: "u2", email: "sarah.chen@meetai.io", name: "Sarah Chen", role: "member", created_at: "2025-10-01T10:00:00Z" },
  { id: "u3", email: "mike.williams@meetai.io", name: "Mike Williams", role: "member", created_at: "2025-10-05T10:00:00Z" },
  { id: "u4", email: "emily.brown@meetai.io", name: "Emily Brown", role: "member", created_at: "2025-11-12T10:00:00Z" },
  { id: "u5", email: "david.lee@meetai.io", name: "David Lee", role: "viewer", created_at: "2025-12-01T10:00:00Z" },
  { id: "u6", email: "lisa.park@meetai.io", name: "Lisa Park", role: "member", created_at: "2026-01-10T10:00:00Z" },
  { id: "u7", email: "james.taylor@meetai.io", name: "James Taylor", role: "member", created_at: "2026-02-14T10:00:00Z" },
  { id: "u8", email: "nina.garcia@meetai.io", name: "Nina Garcia", role: "member", created_at: "2026-03-01T10:00:00Z" },
];

// ── Tags ───────────────────────────────────────────────────────────────────
export const tags: Tag[] = [
  { id: "t1", name: "Engineering", color: "#6366f1" },
  { id: "t2", name: "Product", color: "#8b5cf6" },
  { id: "t3", name: "Design", color: "#ec4899" },
  { id: "t4", name: "Marketing", color: "#f59e0b" },
  { id: "t5", name: "Sprint", color: "#10b981" },
  { id: "t6", name: "Planning", color: "#3b82f6" },
  { id: "t7", name: "Review", color: "#f97316" },
  { id: "t8", name: "Onboarding", color: "#14b8a6" },
];

// ── Participants ───────────────────────────────────────────────────────────
const pAlex: Participant = { id: "p1", name: "Alex Johnson", email: "alex.johnson@meetai.io", role: "organizer" };
const pSarah: Participant = { id: "p2", name: "Sarah Chen", email: "sarah.chen@meetai.io", role: "attendee" };
const pMike: Participant = { id: "p3", name: "Mike Williams", email: "mike.williams@meetai.io", role: "attendee" };
const pEmily: Participant = { id: "p4", name: "Emily Brown", email: "emily.brown@meetai.io", role: "attendee" };
const pDavid: Participant = { id: "p5", name: "David Lee", email: "david.lee@meetai.io", role: "optional" };
const pLisa: Participant = { id: "p6", name: "Lisa Park", email: "lisa.park@meetai.io", role: "attendee" };
const pJames: Participant = { id: "p7", name: "James Taylor", email: "james.taylor@meetai.io", role: "attendee" };
const pNina: Participant = { id: "p8", name: "Nina Garcia", email: "nina.garcia@meetai.io", role: "optional" };

// ── Meetings ───────────────────────────────────────────────────────────────
export const meetings: Meeting[] = [
  {
    id: "m1",
    title: "Sprint 24 Planning",
    description: "Plan the upcoming sprint with the engineering team. Review backlog items and assign tasks.",
    meeting_date: "2026-05-15T09:00:00Z",
    duration_sec: 3240,
    status: "completed",
    meeting_type: "standup",
    created_by: "u1",
    ai_provider: "openai",
    participants: [pAlex, pSarah, pMike, pEmily, pDavid],
    action_items_count: 5,
    comments_count: 3,
    tags: [tags[0], tags[4]],
    created_at: "2026-05-15T08:55:00Z",
    updated_at: "2026-05-15T10:00:00Z",
  },
  {
    id: "m2",
    title: "1:1 with Sarah Chen",
    description: "Weekly sync with Sarah on the design system progress and blockers.",
    meeting_date: "2026-05-14T14:00:00Z",
    duration_sec: 1800,
    status: "completed",
    meeting_type: "one_on_one",
    created_by: "u1",
    ai_provider: "anthropic",
    participants: [pAlex, pSarah],
    action_items_count: 2,
    comments_count: 1,
    tags: [tags[2]],
    created_at: "2026-05-14T13:55:00Z",
    updated_at: "2026-05-14T15:00:00Z",
  },
  {
    id: "m3",
    title: "Q2 Product Roadmap Review",
    description: "Review Q2 product roadmap progress and adjust priorities based on customer feedback.",
    meeting_date: "2026-05-13T10:00:00Z",
    duration_sec: 4500,
    status: "completed",
    meeting_type: "project_review",
    created_by: "u1",
    ai_provider: "openai",
    participants: [pAlex, pSarah, pMike, pEmily, pLisa, pJames],
    action_items_count: 8,
    comments_count: 6,
    tags: [tags[1], tags[5]],
    created_at: "2026-05-13T09:55:00Z",
    updated_at: "2026-05-13T11:30:00Z",
  },
  {
    id: "m4",
    title: "Brainstorm: AI Features for v2.0",
    description: "Creative session to ideate new AI-powered features for the next major release.",
    meeting_date: "2026-05-12T15:00:00Z",
    duration_sec: 3600,
    status: "completed",
    meeting_type: "brainstorm",
    created_by: "u2",
    ai_provider: "gemini",
    participants: [pAlex, pSarah, pMike, pEmily, pNina],
    action_items_count: 4,
    comments_count: 8,
    tags: [tags[0], tags[1]],
    created_at: "2026-05-12T14:55:00Z",
    updated_at: "2026-05-12T16:05:00Z",
  },
  {
    id: "m5",
    title: "Frontend Engineer Interview - Jane Doe",
    description: "Technical interview for Senior Frontend Engineer position.",
    meeting_date: "2026-05-11T11:00:00Z",
    duration_sec: 2700,
    status: "completed",
    meeting_type: "interview",
    created_by: "u1",
    ai_provider: "openai",
    participants: [pAlex, pMike],
    action_items_count: 1,
    comments_count: 2,
    tags: [],
    created_at: "2026-05-11T10:55:00Z",
    updated_at: "2026-05-11T11:45:00Z",
  },
  {
    id: "m6",
    title: "Acme Corp Onboarding Call",
    description: "Initial onboarding call with Acme Corp to walk through the platform and answer questions.",
    meeting_date: "2026-05-10T16:00:00Z",
    duration_sec: 3900,
    status: "completed",
    meeting_type: "client_call",
    created_by: "u1",
    ai_provider: "anthropic",
    participants: [pAlex, pLisa, pDavid],
    action_items_count: 3,
    comments_count: 2,
    tags: [tags[7]],
    created_at: "2026-05-10T15:55:00Z",
    updated_at: "2026-05-10T17:05:00Z",
  },
  {
    id: "m7",
    title: "Design System Sync",
    description: "Align on the design system components, tokens, and documentation.",
    meeting_date: "2026-05-09T13:00:00Z",
    duration_sec: 2400,
    status: "completed",
    meeting_type: "project_review",
    created_by: "u2",
    ai_provider: "openai",
    participants: [pSarah, pEmily, pNina],
    action_items_count: 3,
    comments_count: 4,
    tags: [tags[2], tags[0]],
    created_at: "2026-05-09T12:55:00Z",
    updated_at: "2026-05-09T13:45:00Z",
  },
  {
    id: "m8",
    title: "Weekly Marketing Standup",
    description: "Weekly marketing team standup to review campaigns and content calendar.",
    meeting_date: "2026-05-15T08:00:00Z",
    duration_sec: 1200,
    status: "recording",
    meeting_type: "standup",
    created_by: "u4",
    participants: [pEmily, pJames, pNina],
    action_items_count: 0,
    comments_count: 0,
    tags: [tags[3]],
    created_at: "2026-05-15T07:55:00Z",
    updated_at: "2026-05-15T08:20:00Z",
  },
  {
    id: "m9",
    title: "Architecture Review: Microservices Migration",
    description: "Deep dive into the microservices migration plan with the backend team.",
    meeting_date: "2026-05-16T10:00:00Z",
    duration_sec: 5400,
    status: "scheduled",
    meeting_type: "project_review",
    created_by: "u1",
    participants: [pAlex, pMike, pJames, pDavid],
    action_items_count: 0,
    comments_count: 0,
    tags: [tags[0], tags[5]],
    created_at: "2026-05-14T10:00:00Z",
    updated_at: "2026-05-14T10:00:00Z",
  },
  {
    id: "m10",
    title: "Client Demo: BetaCorp",
    description: "Product demo for BetaCorp stakeholders showcasing new analytics features.",
    meeting_date: "2026-05-08T14:00:00Z",
    duration_sec: 3000,
    status: "completed",
    meeting_type: "client_call",
    created_by: "u1",
    ai_provider: "mistral",
    participants: [pAlex, pLisa, pSarah],
    action_items_count: 2,
    comments_count: 3,
    tags: [tags[1], tags[3]],
    created_at: "2026-05-08T13:55:00Z",
    updated_at: "2026-05-08T14:55:00Z",
  },
];

// ── Transcript Segments ────────────────────────────────────────────────────
export const transcriptSegments: Record<string, TranscriptSegment[]> = {
  m1: [
    { id: "ts1", speaker_name: "Alex Johnson", speaker_color: "#6366f1", start_time: 0, end_time: 18, text: "Good morning everyone. Let's kick off Sprint 24 planning. Sarah, can you give us a quick rundown of what's left from Sprint 23?", confidence: 0.96 },
    { id: "ts2", speaker_name: "Sarah Chen", speaker_color: "#ec4899", start_time: 19, end_time: 42, text: "Sure. We have two carry-over items: the notification service refactor and the dashboard performance optimization. The notification service is about 80% done, and performance work just started.", confidence: 0.94 },
    { id: "ts3", speaker_name: "Mike Williams", speaker_color: "#f59e0b", start_time: 43, end_time: 62, text: "I can pick up the performance optimization. I've already identified the bottleneck -- it's the N+1 query on the meetings list endpoint.", confidence: 0.97 },
    { id: "ts4", speaker_name: "Alex Johnson", speaker_color: "#6366f1", start_time: 63, end_time: 78, text: "Perfect. Let's assign that to you, Mike. Now, for new items -- we have the AI provider selection feature, the export to PDF, and the team invite flow.", confidence: 0.95 },
    { id: "ts5", speaker_name: "Emily Brown", speaker_color: "#10b981", start_time: 79, end_time: 102, text: "I'd like to take the team invite flow. I've already got some designs ready from Lisa. It should be straightforward -- email invites with role selection.", confidence: 0.93 },
    { id: "ts6", speaker_name: "David Lee", speaker_color: "#3b82f6", start_time: 103, end_time: 125, text: "The AI provider selection is interesting. Are we thinking a dropdown in settings, or per-meeting selection? I think per-meeting gives users more flexibility.", confidence: 0.91 },
    { id: "ts7", speaker_name: "Alex Johnson", speaker_color: "#6366f1", start_time: 126, end_time: 148, text: "Good point, David. Let's do both -- a default in settings with the option to override per meeting. Sarah, can you own that feature since you have context on the AI integration?", confidence: 0.95 },
    { id: "ts8", speaker_name: "Sarah Chen", speaker_color: "#ec4899", start_time: 149, end_time: 165, text: "Absolutely. I'll create the API endpoints and the UI component. We should support OpenAI, Anthropic, Gemini, and Mistral out of the gate.", confidence: 0.96 },
    { id: "ts9", speaker_name: "Mike Williams", speaker_color: "#f59e0b", start_time: 166, end_time: 182, text: "For the export to PDF, I've been looking at react-pdf. It handles our transcript format well and supports custom styling.", confidence: 0.94 },
    { id: "ts10", speaker_name: "Alex Johnson", speaker_color: "#6366f1", start_time: 183, end_time: 200, text: "Great. Let's finalize the sprint scope. We have 5 items total. Does anyone have concerns about capacity? David, are you blocked on anything?", confidence: 0.95 },
  ],
  m2: [
    { id: "ts11", speaker_name: "Alex Johnson", speaker_color: "#6366f1", start_time: 0, end_time: 15, text: "Hey Sarah, how are things going with the design system? Any blockers I should know about?", confidence: 0.97 },
    { id: "ts12", speaker_name: "Sarah Chen", speaker_color: "#ec4899", start_time: 16, end_time: 38, text: "Things are moving well. I've completed the component library audit and documented all inconsistencies. The main blocker is getting sign-off on the new color tokens from the brand team.", confidence: 0.95 },
    { id: "ts13", speaker_name: "Alex Johnson", speaker_color: "#6366f1", start_time: 39, end_time: 52, text: "I can help unblock that. I'll set up a quick call with the brand team this week. What else is on your plate?", confidence: 0.96 },
    { id: "ts14", speaker_name: "Sarah Chen", speaker_color: "#ec4899", start_time: 53, end_time: 75, text: "I'm also working on the dark mode implementation. It's about 60% done. The tricky part is making sure all the glassmorphism effects work correctly in both themes.", confidence: 0.94 },
    { id: "ts15", speaker_name: "Alex Johnson", speaker_color: "#6366f1", start_time: 76, end_time: 90, text: "That's a priority for the next release. Let me know if you need any frontend help. Mike might have bandwidth after his current task.", confidence: 0.95 },
  ],
  m3: [
    { id: "ts16", speaker_name: "Alex Johnson", speaker_color: "#6366f1", start_time: 0, end_time: 20, text: "Welcome to the Q2 Roadmap Review. We're halfway through the quarter, so let's assess where we stand against our goals.", confidence: 0.96 },
    { id: "ts17", speaker_name: "Lisa Park", speaker_color: "#14b8a6", start_time: 21, end_time: 48, text: "On the product side, we've shipped 4 of 7 planned features. The AI summary improvements and the new dashboard are live. We're on track for the export feature and team collaboration tools.", confidence: 0.93 },
    { id: "ts18", speaker_name: "James Taylor", speaker_color: "#f97316", start_time: 49, end_time: 72, text: "From marketing, we've seen a 35% increase in sign-ups since the new landing page launched. The webinar series is driving most of the traffic. We should double down on that channel.", confidence: 0.91 },
    { id: "ts19", speaker_name: "Sarah Chen", speaker_color: "#ec4899", start_time: 73, end_time: 95, text: "Design-wise, we've completed the component library v2 and the accessibility audit. The main gap is mobile responsiveness -- we need to prioritize that for the next sprint.", confidence: 0.95 },
    { id: "ts20", speaker_name: "Mike Williams", speaker_color: "#f59e0b", start_time: 96, end_time: 118, text: "Engineering velocity is strong. We're averaging 23 story points per sprint, up from 18 last quarter. The new CI/CD pipeline cut deployment time by 60%.", confidence: 0.94 },
  ],
};

// ── Summaries ──────────────────────────────────────────────────────────────
export const summaries: Summary[] = [
  {
    id: "s1", meeting_id: "m1", summary_type: "brief",
    content: "Sprint 24 planning session covered 5 items: notification service refactor carry-over (Sarah, 80% done), dashboard performance optimization (Mike, N+1 query fix), AI provider selection feature (Sarah, multi-provider support), export to PDF (Mike, using react-pdf), and team invite flow (Emily, email-based with roles). Sprint capacity looks healthy with no major blockers.",
    ai_provider: "openai", model: "gpt-4o", tokens_used: 1240, created_at: "2026-05-15T10:05:00Z",
  },
  {
    id: "s2", meeting_id: "m1", summary_type: "detailed",
    content: "## Sprint 24 Planning Summary\n\n### Carry-over Items\n- **Notification Service Refactor** (Sarah): 80% complete, remaining work is the real-time WebSocket integration.\n- **Dashboard Performance** (Mike): Root cause identified as N+1 query on meetings list endpoint. Estimated 2 days to fix.\n\n### New Items\n- **AI Provider Selection**: Support OpenAI, Anthropic, Gemini, and Mistral. Default in settings, overridable per meeting. Sarah to own.\n- **Export to PDF**: Using react-pdf library. Mike to implement. Should include transcript, summary, and action items.\n- **Team Invite Flow**: Email-based invites with role selection. Emily to build, designs from Lisa already ready.\n\n### Decisions\n- AI provider will have both global default (settings) and per-meeting override.\n- Sprint capacity confirmed as adequate by all team members.\n\n### Risks\n- Brand team sign-off pending for design system color tokens (affects Sarah's dark mode work).",
    ai_provider: "openai", model: "gpt-4o", tokens_used: 3480, created_at: "2026-05-15T10:05:00Z",
  },
  {
    id: "s3", meeting_id: "m2", summary_type: "brief",
    content: "1:1 covered design system progress. Sarah completed the component library audit and is 60% through dark mode implementation. Main blocker is brand team sign-off on color tokens -- Alex will schedule a call to unblock. Mobile responsiveness needs prioritization next sprint.",
    ai_provider: "anthropic", model: "claude-sonnet-4-20250514", tokens_used: 890, created_at: "2026-05-14T15:05:00Z",
  },
  {
    id: "s4", meeting_id: "m3", summary_type: "brief",
    content: "Q2 midpoint review: 4 of 7 features shipped. AI summaries and new dashboard live. Sign-ups up 35% from new landing page. Engineering velocity improved to 23 pts/sprint. Key gaps: mobile responsiveness and export feature. Team collaboration tools on track.",
    ai_provider: "openai", model: "gpt-4o", tokens_used: 1100, created_at: "2026-05-13T11:35:00Z",
  },
  {
    id: "s5", meeting_id: "m4", summary_type: "brief",
    content: "Brainstorm session generated 12 ideas for v2.0 AI features. Top voted: real-time translation, smart meeting scheduling assistant, automatic follow-up emails, and sentiment analysis dashboard. Team agreed to prototype the top 3 in the next sprint.",
    ai_provider: "gemini", model: "gemini-pro", tokens_used: 950, created_at: "2026-05-12T16:10:00Z",
  },
];

// ── Action Items ───────────────────────────────────────────────────────────
export const actionItems: ActionItem[] = [
  { id: "a1", meeting_id: "m1", meeting_title: "Sprint 24 Planning", assigned_to: "u3", assigned_name: "Mike Williams", description: "Fix N+1 query on meetings list endpoint for dashboard performance", priority: "high", status: "in_progress", due_date: "2026-05-17", context: "Identified as root cause of slow dashboard load times", created_at: "2026-05-15T10:00:00Z" },
  { id: "a2", meeting_id: "m1", meeting_title: "Sprint 24 Planning", assigned_to: "u2", assigned_name: "Sarah Chen", description: "Complete notification service WebSocket integration", priority: "high", status: "in_progress", due_date: "2026-05-18", context: "Carry-over from Sprint 23, 80% done", created_at: "2026-05-15T10:00:00Z" },
  { id: "a3", meeting_id: "m1", meeting_title: "Sprint 24 Planning", assigned_to: "u2", assigned_name: "Sarah Chen", description: "Build AI provider selection feature with settings default and per-meeting override", priority: "medium", status: "pending", due_date: "2026-05-22", context: "Support OpenAI, Anthropic, Gemini, Mistral", created_at: "2026-05-15T10:00:00Z" },
  { id: "a4", meeting_id: "m1", meeting_title: "Sprint 24 Planning", assigned_to: "u3", assigned_name: "Mike Williams", description: "Implement PDF export using react-pdf for meeting transcripts and summaries", priority: "medium", status: "pending", due_date: "2026-05-20", context: "Include transcript, summary, and action items in export", created_at: "2026-05-15T10:00:00Z" },
  { id: "a5", meeting_id: "m1", meeting_title: "Sprint 24 Planning", assigned_to: "u4", assigned_name: "Emily Brown", description: "Build team invite flow with email invites and role selection", priority: "medium", status: "pending", due_date: "2026-05-21", context: "Designs from Lisa are ready", created_at: "2026-05-15T10:00:00Z" },
  { id: "a6", meeting_id: "m2", meeting_title: "1:1 with Sarah Chen", assigned_to: "u1", assigned_name: "Alex Johnson", description: "Schedule call with brand team to approve new color tokens for design system", priority: "high", status: "pending", due_date: "2026-05-16", context: "Blocking Sarah's dark mode implementation", created_at: "2026-05-14T15:00:00Z" },
  { id: "a7", meeting_id: "m2", meeting_title: "1:1 with Sarah Chen", assigned_to: "u2", assigned_name: "Sarah Chen", description: "Complete dark mode implementation for glassmorphism components", priority: "medium", status: "in_progress", due_date: "2026-05-23", context: "60% complete, waiting on color token approval", created_at: "2026-05-14T15:00:00Z" },
  { id: "a8", meeting_id: "m3", meeting_title: "Q2 Product Roadmap Review", assigned_to: "u6", assigned_name: "Lisa Park", description: "Finalize mobile responsiveness plan and create tickets", priority: "high", status: "pending", due_date: "2026-05-17", context: "Identified as key gap in Q2 review", created_at: "2026-05-13T11:30:00Z" },
  { id: "a9", meeting_id: "m3", meeting_title: "Q2 Product Roadmap Review", assigned_to: "u7", assigned_name: "James Taylor", description: "Double down on webinar marketing channel - plan next 3 webinars", priority: "medium", status: "in_progress", due_date: "2026-05-20", context: "35% sign-up increase from webinars", created_at: "2026-05-13T11:30:00Z" },
  { id: "a10", meeting_id: "m3", meeting_title: "Q2 Product Roadmap Review", assigned_to: "u1", assigned_name: "Alex Johnson", description: "Review and prioritize remaining Q2 features: export, collaboration tools", priority: "high", status: "completed", due_date: "2026-05-15", completed_at: "2026-05-14T16:00:00Z", context: "3 features remaining of 7 planned", created_at: "2026-05-13T11:30:00Z" },
  { id: "a11", meeting_id: "m4", meeting_title: "Brainstorm: AI Features for v2.0", assigned_to: "u2", assigned_name: "Sarah Chen", description: "Prototype real-time translation feature for live meetings", priority: "medium", status: "pending", due_date: "2026-05-25", context: "Top voted idea from brainstorm", created_at: "2026-05-12T16:00:00Z" },
  { id: "a12", meeting_id: "m4", meeting_title: "Brainstorm: AI Features for v2.0", assigned_to: "u3", assigned_name: "Mike Williams", description: "Prototype smart meeting scheduling assistant", priority: "low", status: "pending", due_date: "2026-05-28", context: "Second most voted idea", created_at: "2026-05-12T16:00:00Z" },
  { id: "a13", meeting_id: "m5", meeting_title: "Frontend Engineer Interview - Jane Doe", assigned_to: "u1", assigned_name: "Alex Johnson", description: "Submit interview feedback for Jane Doe and coordinate with hiring team", priority: "urgent", status: "completed", due_date: "2026-05-12", completed_at: "2026-05-11T14:00:00Z", context: "Strong candidate, recommended for next round", created_at: "2026-05-11T11:45:00Z" },
  { id: "a14", meeting_id: "m6", meeting_title: "Acme Corp Onboarding Call", assigned_to: "u6", assigned_name: "Lisa Park", description: "Send Acme Corp onboarding documentation and setup guide", priority: "high", status: "completed", due_date: "2026-05-11", completed_at: "2026-05-10T18:00:00Z", context: "New enterprise client", created_at: "2026-05-10T17:00:00Z" },
  { id: "a15", meeting_id: "m6", meeting_title: "Acme Corp Onboarding Call", assigned_to: "u1", assigned_name: "Alex Johnson", description: "Schedule follow-up check-in with Acme Corp for next week", priority: "medium", status: "pending", due_date: "2026-05-17", context: "Ensure smooth onboarding experience", created_at: "2026-05-10T17:00:00Z" },
  { id: "a16", meeting_id: "m7", meeting_title: "Design System Sync", assigned_to: "u2", assigned_name: "Sarah Chen", description: "Document new design tokens and update Storybook", priority: "medium", status: "in_progress", due_date: "2026-05-16", context: "Design system v2 components ready", created_at: "2026-05-09T13:45:00Z" },
  { id: "a17", meeting_id: "m7", meeting_title: "Design System Sync", assigned_to: "u8", assigned_name: "Nina Garcia", description: "Create accessibility testing checklist for all components", priority: "medium", status: "pending", due_date: "2026-05-19", context: "Post accessibility audit follow-up", created_at: "2026-05-09T13:45:00Z" },
  { id: "a18", meeting_id: "m10", meeting_title: "Client Demo: BetaCorp", assigned_to: "u6", assigned_name: "Lisa Park", description: "Send BetaCorp the analytics feature documentation and pricing", priority: "high", status: "completed", due_date: "2026-05-09", completed_at: "2026-05-08T16:00:00Z", context: "Demo went well, they're interested in analytics", created_at: "2026-05-08T15:00:00Z" },
  { id: "a19", meeting_id: "m10", meeting_title: "Client Demo: BetaCorp", assigned_to: "u1", assigned_name: "Alex Johnson", description: "Follow up with BetaCorp on trial activation and feature requests", priority: "medium", status: "pending", due_date: "2026-05-15", context: "Interested in custom dashboards", created_at: "2026-05-08T15:00:00Z" },
  { id: "a20", meeting_id: "m3", meeting_title: "Q2 Product Roadmap Review", assigned_to: "u5", assigned_name: "David Lee", description: "Prepare technical feasibility report for remaining Q2 features", priority: "medium", status: "cancelled", due_date: "2026-05-14", context: "Needed for prioritization decisions", created_at: "2026-05-13T11:30:00Z" },
];

// ── Comments ───────────────────────────────────────────────────────────────
export const comments: Comment[] = [
  {
    id: "c1", meeting_id: "m1", user: users[0], content: "Great planning session! I've updated the sprint board with all items.", time_reference: 200, created_at: "2026-05-15T10:10:00Z",
    replies: [
      { id: "c1r1", meeting_id: "m1", user: users[1], parent_id: "c1", content: "Thanks Alex! I'll start on the AI provider feature tomorrow morning.", created_at: "2026-05-15T10:15:00Z" },
    ],
  },
  {
    id: "c2", meeting_id: "m1", user: users[2], content: "The N+1 fix should be straightforward. I'll have a PR up by EOD tomorrow.", time_reference: 62, created_at: "2026-05-15T10:20:00Z",
  },
  {
    id: "c3", meeting_id: "m1", user: users[3], content: "Lisa shared the invite flow designs in Figma. Looking good!", created_at: "2026-05-15T10:25:00Z",
  },
  {
    id: "c4", meeting_id: "m3", user: users[0], content: "The 35% sign-up increase is impressive. We should attribute it to specific channels.", created_at: "2026-05-13T11:35:00Z",
    replies: [
      { id: "c4r1", meeting_id: "m3", user: users[6], parent_id: "c4", content: "I have the attribution data. Webinars account for 60% of that growth.", created_at: "2026-05-13T11:40:00Z" },
      { id: "c4r2", meeting_id: "m3", user: users[0], parent_id: "c4", content: "That's significant. Let's put together a proposal to increase webinar frequency.", created_at: "2026-05-13T11:42:00Z" },
    ],
  },
  {
    id: "c5", meeting_id: "m4", user: users[1], content: "The translation feature idea got the most votes. I think we can leverage existing APIs for the prototype.", created_at: "2026-05-12T16:10:00Z",
  },
  {
    id: "c6", meeting_id: "m2", user: users[0], content: "I've scheduled the brand team call for Thursday. Should unblock you by Friday.", time_reference: 52, created_at: "2026-05-14T15:10:00Z",
  },
];

// ── Templates ──────────────────────────────────────────────────────────────
export const templates: Template[] = [
  {
    id: "tmpl1", name: "Daily Standup", description: "Quick daily sync to share progress, plans, and blockers.", category: "Engineering", icon: "Zap",
    structure: { sections: ["What did you do yesterday?", "What will you do today?", "Any blockers?"], duration_target: 15 },
    is_default: true, is_system: true, usage_count: 142, created_at: "2025-09-20T10:00:00Z",
  },
  {
    id: "tmpl2", name: "1:1 Meeting", description: "One-on-one meeting template for manager check-ins and career discussions.", category: "Management", icon: "Users",
    structure: { sections: ["Personal check-in", "Project updates", "Feedback & growth", "Action items"], duration_target: 30 },
    is_default: false, is_system: true, usage_count: 89, created_at: "2025-09-20T10:00:00Z",
  },
  {
    id: "tmpl3", name: "Project Review", description: "Structured review of project progress, milestones, and risks.", category: "Product", icon: "FolderOpen",
    structure: { sections: ["Progress since last review", "Milestone status", "Risks & blockers", "Next steps"], duration_target: 60 },
    is_default: false, is_system: true, usage_count: 56, created_at: "2025-10-01T10:00:00Z",
  },
  {
    id: "tmpl4", name: "Brainstorm Session", description: "Creative ideation session with structured capture of ideas.", category: "Creative", icon: "Lightbulb",
    structure: { sections: ["Problem statement", "Ideation (diverge)", "Evaluation (converge)", "Top ideas & next steps"], duration_target: 45 },
    is_default: false, is_system: true, usage_count: 34, created_at: "2025-10-15T10:00:00Z",
  },
  {
    id: "tmpl5", name: "Interview", description: "Technical or behavioral interview template with evaluation criteria.", category: "Hiring", icon: "UserCheck",
    structure: { sections: ["Introduction", "Technical/behavioral questions", "Candidate questions", "Evaluation notes"], duration_target: 45 },
    is_default: false, is_system: true, usage_count: 28, created_at: "2025-11-01T10:00:00Z",
  },
  {
    id: "tmpl6", name: "Client Call", description: "Professional client meeting template for demos, check-ins, and reviews.", category: "Sales", icon: "Phone",
    structure: { sections: ["Agenda confirmation", "Updates & demos", "Client feedback", "Next steps & follow-up"], duration_target: 30 },
    is_default: false, is_system: true, usage_count: 45, created_at: "2025-11-10T10:00:00Z",
  },
];

// ── Analytics ──────────────────────────────────────────────────────────────
export const analyticsOverview: AnalyticsOverview = {
  total_meetings: 47,
  total_hours: 128,
  total_action_items: 89,
  completed_action_items: 23,
  team_members: 12,
  meetings_this_week: 6,
  avg_duration: 42,
};

export const speakerStats: SpeakerStats[] = [
  { name: "Alex Johnson", talk_time_sec: 3420, percentage: 28, meeting_count: 42 },
  { name: "Sarah Chen", talk_time_sec: 2880, percentage: 24, meeting_count: 38 },
  { name: "Mike Williams", talk_time_sec: 2160, percentage: 18, meeting_count: 35 },
  { name: "Emily Brown", talk_time_sec: 1800, percentage: 15, meeting_count: 30 },
  { name: "David Lee", talk_time_sec: 1080, percentage: 9, meeting_count: 25 },
  { name: "Lisa Park", talk_time_sec: 720, percentage: 6, meeting_count: 20 },
];

export const meetingsOverTime = [
  { date: "Apr 16", meetings: 2, hours: 1.5 },
  { date: "Apr 17", meetings: 1, hours: 1.0 },
  { date: "Apr 18", meetings: 3, hours: 2.5 },
  { date: "Apr 19", meetings: 0, hours: 0 },
  { date: "Apr 20", meetings: 0, hours: 0 },
  { date: "Apr 21", meetings: 1, hours: 0.75 },
  { date: "Apr 22", meetings: 2, hours: 1.8 },
  { date: "Apr 23", meetings: 1, hours: 1.0 },
  { date: "Apr 24", meetings: 2, hours: 2.0 },
  { date: "Apr 25", meetings: 3, hours: 3.2 },
  { date: "Apr 26", meetings: 0, hours: 0 },
  { date: "Apr 27", meetings: 0, hours: 0 },
  { date: "Apr 28", meetings: 1, hours: 0.5 },
  { date: "Apr 29", meetings: 2, hours: 1.5 },
  { date: "Apr 30", meetings: 1, hours: 1.0 },
  { date: "May 1", meetings: 2, hours: 2.0 },
  { date: "May 2", meetings: 3, hours: 2.8 },
  { date: "May 3", meetings: 0, hours: 0 },
  { date: "May 4", meetings: 0, hours: 0 },
  { date: "May 5", meetings: 1, hours: 1.0 },
  { date: "May 6", meetings: 2, hours: 1.5 },
  { date: "May 7", meetings: 1, hours: 0.75 },
  { date: "May 8", meetings: 2, hours: 2.2 },
  { date: "May 9", meetings: 1, hours: 1.0 },
  { date: "May 10", meetings: 1, hours: 1.1 },
  { date: "May 11", meetings: 1, hours: 0.75 },
  { date: "May 12", meetings: 1, hours: 1.0 },
  { date: "May 13", meetings: 1, hours: 1.25 },
  { date: "May 14", meetings: 1, hours: 0.5 },
  { date: "May 15", meetings: 2, hours: 1.8 },
];

export const meetingsByType = [
  { type: "Standup", count: 18, color: "#10b981" },
  { type: "1:1", count: 12, color: "#3b82f6" },
  { type: "Project Review", count: 8, color: "#8b5cf6" },
  { type: "Brainstorm", count: 4, color: "#f59e0b" },
  { type: "Interview", count: 3, color: "#f43f5e" },
  { type: "Client Call", count: 2, color: "#06b6d4" },
];

export const actionItemsByStatus = [
  { status: "Pending", count: 9, color: "#a1a1aa" },
  { status: "In Progress", count: 5, color: "#3b82f6" },
  { status: "Completed", count: 5, color: "#10b981" },
  { status: "Overdue", count: 1, color: "#ef4444" },
];
