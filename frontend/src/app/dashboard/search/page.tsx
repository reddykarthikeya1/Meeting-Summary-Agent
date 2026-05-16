"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Search as SearchIcon,
  Calendar,
  Clock,
  Users,
  FileText,
  ListChecks,
  MessageSquare,
  X,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StaggerContainer, StaggerItem } from "@/components/shared/stagger-children";
import { meetings, actionItems, transcriptSegments } from "@/lib/mock-data";
import { formatDate, formatDuration, getInitials } from "@/lib/utils";
import { MEETING_TYPES, STATUS_COLORS } from "@/lib/constants";

const filterChips = [
  { label: "Meetings", value: "meetings", icon: Calendar },
  { label: "Transcripts", value: "transcripts", icon: FileText },
  { label: "Action Items", value: "actions", icon: ListChecks },
  { label: "Comments", value: "comments", icon: MessageSquare },
];

interface SearchResult {
  id: string;
  type: "meeting" | "transcript" | "action" | "comment";
  title: string;
  snippet: string;
  meetingId?: string;
  date: string;
  metadata?: string;
}

function getAllResults(): SearchResult[] {
  const results: SearchResult[] = [];

  // Meetings
  meetings.forEach((m) => {
    results.push({
      id: `meeting-${m.id}`,
      type: "meeting",
      title: m.title,
      snippet: m.description || "",
      meetingId: m.id,
      date: m.meeting_date,
      metadata: `${formatDuration(m.duration_sec ?? 0)} | ${m.participant_count} participants`,
    });
  });

  // Transcript segments
  Object.entries(transcriptSegments).forEach(([meetingId, segments]) => {
    const meeting = meetings.find((m) => m.id === meetingId);
    if (!meeting) return;
    segments.forEach((seg) => {
      results.push({
        id: `transcript-${seg.id}`,
        type: "transcript",
        title: `${seg.speaker_name} in "${meeting.title}"`,
        snippet: seg.text,
        meetingId,
        date: meeting.meeting_date,
        metadata: `${seg.speaker_name} at ${Math.floor(seg.start_time / 60)}:${String(seg.start_time % 60).padStart(2, "0")}`,
      });
    });
  });

  // Action items
  actionItems.forEach((a) => {
    results.push({
      id: `action-${a.id}`,
      type: "action",
      title: a.description,
      snippet: a.context || "",
      meetingId: a.meeting_id,
      date: a.created_at,
      metadata: `Assigned to ${a.assigned_name} | ${a.priority} priority`,
    });
  });

  return results;
}

const allResults = getAllResults();

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="rounded bg-primary/20 px-0.5 text-primary">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

const typeIcons: Record<string, React.ElementType> = {
  meeting: Calendar,
  transcript: FileText,
  action: ListChecks,
  comment: MessageSquare,
};

const typeColors: Record<string, string> = {
  meeting: "bg-blue-500/10 text-blue-500",
  transcript: "bg-violet-500/10 text-violet-500",
  action: "bg-emerald-500/10 text-emerald-500",
  comment: "bg-amber-500/10 text-amber-500",
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  const toggleFilter = (value: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const results = allResults.filter((r) => {
    if (query && !r.title.toLowerCase().includes(query.toLowerCase()) && !r.snippet.toLowerCase().includes(query.toLowerCase())) {
      return false;
    }
    if (activeFilters.size > 0 && !activeFilters.has(r.type === "comment" ? "comments" : `${r.type}s`)) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        <p className="mt-1 text-muted-foreground">
          Search across all meetings, transcripts, action items, and comments.
        </p>
      </motion.div>

      {/* Search Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search meetings, transcripts, action items..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-14 pl-12 pr-12 text-lg"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2"
              onClick={() => setQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </motion.div>

      {/* Filter Chips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="flex flex-wrap gap-2"
      >
        {filterChips.map((chip) => {
          const Icon = chip.icon;
          const active = activeFilters.has(chip.value);
          return (
            <Button
              key={chip.value}
              variant={active ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => toggleFilter(chip.value)}
            >
              <Icon className="h-3.5 w-3.5" />
              {chip.label}
            </Button>
          );
        })}
        {activeFilters.size > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveFilters(new Set())}
          >
            Clear filters
          </Button>
        )}
      </motion.div>

      {/* Results */}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          {query ? `${results.length} results for "${query}"` : `${results.length} items`}
        </p>
      </div>

      <StaggerContainer className="space-y-2">
        {results.slice(0, 50).map((result) => {
          const Icon = typeIcons[result.type] || Calendar;
          const color = typeColors[result.type] || "bg-muted text-muted-foreground";
          const typeLabel = result.type === "action" ? "Action Item" : result.type.charAt(0).toUpperCase() + result.type.slice(1);

          return (
            <StaggerItem key={result.id}>
              <Link href={result.meetingId ? `/dashboard/meetings/${result.meetingId}` : "#"}>
                <Card className="group cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold group-hover:text-primary transition-colors">
                          {highlightMatch(result.title, query)}
                        </h3>
                        <Badge variant="outline" className="shrink-0 text-[10px]">
                          {typeLabel}
                        </Badge>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                        {highlightMatch(result.snippet, query)}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{formatDate(result.date)}</span>
                        {result.metadata && <span>{result.metadata}</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* Empty state */}
      {query && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <SearchIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No results found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try different keywords or adjust your filters.
          </p>
        </div>
      )}

      {/* Initial state */}
      {!query && results.length === allResults.length && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Start typing to search across all your meeting data.
          </p>
        </div>
      )}
    </div>
  );
}
