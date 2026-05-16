export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: "admin" | "member" | "viewer";
  created_at: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  meeting_date: string;
  duration_sec: number | null;
  status: "scheduled" | "recording" | "processing" | "completed" | "failed";
  meeting_type: string;
  created_by: string;
  team_id?: string;
  audio_file_url?: string;
  ai_provider?: string;
  metadata?: Record<string, unknown> | null;
  is_archived: boolean;
  participant_count: number;
  action_item_count: number;
  has_transcript: boolean;
  has_summary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  name: string;
  email?: string;
  role: "organizer" | "attendee" | "optional";
  avatar_url?: string;
}

export interface TranscriptSegment {
  id: string;
  speaker_id?: string;
  speaker_name: string;
  speaker_color: string;
  start_time: number;
  end_time: number;
  text: string;
  confidence: number;
}

export interface Summary {
  id: string;
  meeting_id: string;
  summary_type: "brief" | "detailed" | "bullet_points" | "executive";
  content: string;
  ai_provider: string;
  model: string;
  tokens_used: number;
  created_at: string;
}

export interface ActionItem {
  id: string;
  meeting_id: string;
  meeting_title?: string;
  assigned_to?: string;
  assigned_name: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "in_progress" | "completed" | "cancelled";
  due_date?: string;
  completed_at?: string;
  context?: string;
  created_at: string;
}

export interface Comment {
  id: string;
  meeting_id: string;
  user_id: string;
  user_name?: string;
  parent_id?: string;
  content: string;
  time_reference?: string;
  replies?: Comment[];
  created_at: string;
  updated_at: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  structure: { sections: string[]; duration_target?: number; [key: string]: unknown };
  is_default: boolean;
  is_system: boolean;
  usage_count: number;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface AnalyticsOverview {
  total_meetings: number;
  total_hours: number;
  total_action_items: number;
  completed_action_items: number;
  team_members: number;
  meetings_this_week: number;
  avg_duration: number;
}

export interface SpeakerStats {
  name: string;
  talk_time_sec: number;
  percentage: number;
  meeting_count: number;
}

export type ViewMode = "grid" | "list";
export type SortOption = "date" | "title" | "duration" | "participants";
export type SortDirection = "asc" | "desc";
