"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Calendar,
  Clock,
  Filter,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StaggerContainer, StaggerItem } from "@/components/shared/stagger-children";
import { meetings } from "@/lib/mock-data";
import { formatDate, formatDuration, getInitials } from "@/lib/utils";
import { MEETING_TYPES, STATUS_COLORS } from "@/lib/constants";
import type { ViewMode } from "@/lib/types";

export default function MeetingsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = meetings.filter((m) => {
    if (search && !m.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && m.status !== statusFilter) return false;
    if (typeFilter !== "all" && m.meeting_type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meetings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage and review all your recorded meetings.
          </p>
        </div>
        <Link href="/dashboard/meetings/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Meeting
          </Button>
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search meetings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="recording">Recording</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {MEETING_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 rounded-md border border-input p-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Meeting Cards */}
      {viewMode === "grid" ? (
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((meeting) => {
            const type = MEETING_TYPES.find((t) => t.value === meeting.meeting_type);
            return (
              <StaggerItem key={meeting.id}>
                <Link href={`/dashboard/meetings/${meeting.id}`}>
                  <motion.div
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-lg hover:border-primary/30">
                      <div className="p-5">
                        {/* Type Badge + Status */}
                        <div className="flex items-center justify-between">
                          {type && (
                            <Badge variant="secondary" className="text-xs">
                              {type.label}
                            </Badge>
                          )}
                          <Badge className={`text-[10px] ${STATUS_COLORS[meeting.status]}`}>
                            {meeting.status}
                          </Badge>
                        </div>

                        {/* Title */}
                        <h3 className="mt-3 text-base font-semibold group-hover:text-primary transition-colors line-clamp-2">
                          {meeting.title}
                        </h3>

                        {/* Date & Duration */}
                        <div className="mt-2 flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(meeting.meeting_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDuration(meeting.duration_sec)}
                          </span>
                        </div>

                        {/* Participants */}
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {meeting.participants.slice(0, 4).map((p) => (
                              <Avatar key={p.id} className="h-7 w-7 border-2 border-background">
                                <AvatarFallback className="text-[10px] bg-muted">
                                  {getInitials(p.name)}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {meeting.participants.length > 4 && (
                              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground">
                                +{meeting.participants.length - 4}
                              </div>
                            )}
                          </div>
                          {meeting.action_items_count > 0 && (
                            <Badge variant="outline" className="text-[10px]">
                              {meeting.action_items_count} actions
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      ) : (
        <div className="space-y-2">
          {filtered.map((meeting, i) => {
            const type = MEETING_TYPES.find((t) => t.value === meeting.meeting_type);
            return (
              <motion.div
                key={meeting.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link href={`/dashboard/meetings/${meeting.id}`}>
                  <Card className="group cursor-pointer transition-shadow hover:shadow-md hover:border-primary/30">
                    <div className="flex items-center gap-4 p-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Video className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-sm font-semibold group-hover:text-primary transition-colors">
                            {meeting.title}
                          </h3>
                          {type && (
                            <Badge variant="secondary" className="shrink-0 text-[10px]">
                              {type.label}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(meeting.meeting_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDuration(meeting.duration_sec)}
                          </span>
                          <span>{meeting.participants.length} participants</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-1.5">
                          {meeting.participants.slice(0, 3).map((p) => (
                            <Avatar key={p.id} className="h-6 w-6 border-2 border-background">
                              <AvatarFallback className="text-[8px] bg-muted">
                                {getInitials(p.name)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <Badge className={`text-[10px] ${STATUS_COLORS[meeting.status]}`}>
                          {meeting.status}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No meetings found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your filters or create a new meeting.
          </p>
        </div>
      )}
    </div>
  );
}
