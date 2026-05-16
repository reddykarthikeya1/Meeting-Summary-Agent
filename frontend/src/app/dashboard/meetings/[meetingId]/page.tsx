"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Play,
  Pause,
  CheckCircle2,
  Circle,
  MessageSquare,
  StickyNote,
  FileText,
  ListChecks,
  Mic,
  Sparkles,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { AnimatedPage } from "@/components/shared/animated-page";
import { FadeIn } from "@/components/shared/fade-in";
import {
  meetings,
  transcriptSegments,
  summaries,
  actionItems,
  comments as allComments,
} from "@/lib/mock-data";
import { formatDate, formatDuration, formatTime, getInitials } from "@/lib/utils";
import { STATUS_COLORS, MEETING_TYPES, PRIORITY_COLORS } from "@/lib/constants";

export default function MeetingDetailPage() {
  const params = useParams();
  const meetingId = params.meetingId as string;
  const meeting = meetings.find((m) => m.id === meetingId);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [notes, setNotes] = useState("");
  const [commentText, setCommentText] = useState("");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [waveformHeights] = useState(() =>
    Array.from({ length: 60 }, () => Math.random() * 100)
  );

  const segments = transcriptSegments[meetingId] || [];
  const meetingSummaries = summaries.filter((s) => s.meeting_id === meetingId);
  const meetingActions = actionItems.filter((a) => a.meeting_id === meetingId);
  const meetingComments = allComments.filter((c) => c.meeting_id === meetingId);

  useEffect(() => {
    if (!isPlaying || !meeting) return;
    const duration = meeting.duration_sec ?? 0;
    const interval = setInterval(() => {
      setCurrentTime((t) => {
        if (t >= duration) {
          setIsPlaying(false);
          return duration;
        }
        return t + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, meeting]);

  if (!meeting) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-2xl font-bold">Meeting not found</h2>
        <p className="mt-2 text-muted-foreground">The meeting you are looking for does not exist.</p>
        <Link href="/dashboard/meetings">
          <Button className="mt-4">Back to Meetings</Button>
        </Link>
      </div>
    );
  }

  const type = MEETING_TYPES.find((t) => t.value === meeting.meeting_type);
  const briefSummary = meetingSummaries.find((s) => s.summary_type === "brief");
  const detailedSummary = meetingSummaries.find((s) => s.summary_type === "detailed");

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        {/* Back + Header */}
        <div className="flex items-start gap-4">
          <Link href="/dashboard/meetings">
            <Button variant="ghost" size="icon" className="mt-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {type && <Badge variant="secondary">{type.label}</Badge>}
              <Badge className={STATUS_COLORS[meeting.status]}>{meeting.status}</Badge>
              {meeting.ai_provider && (
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  {meeting.ai_provider}
                </Badge>
              )}
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight">{meeting.title}</h1>
            {meeting.description && (
              <p className="mt-1 text-muted-foreground">{meeting.description}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(meeting.meeting_date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {formatDuration(meeting.duration_sec ?? 0)}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {meeting.participant_count} participants
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Tabs */}
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="summary" className="gap-2">
              <FileText className="h-4 w-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="transcript" className="gap-2">
              <Mic className="h-4 w-4" />
              Transcript
            </TabsTrigger>
            <TabsTrigger value="actions" className="gap-2">
              <ListChecks className="h-4 w-4" />
              Action Items ({meetingActions.length})
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <StickyNote className="h-4 w-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="comments" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments ({meetingComments.length})
            </TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            {briefSummary && (
              <FadeIn>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">AI Summary</CardTitle>
                      <Badge variant="outline" className="gap-1">
                        <Sparkles className="h-3 w-3" />
                        {briefSummary.ai_provider} / {briefSummary.model}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {briefSummary.content}
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
            )}
            {detailedSummary && (
              <FadeIn delay={0.1}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Detailed Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {detailedSummary.content.split("\n").map((line, i) => {
                        if (line.startsWith("## ")) {
                          return <h2 key={i} className="text-lg font-semibold mt-4 mb-2">{line.slice(3)}</h2>;
                        }
                        if (line.startsWith("### ")) {
                          return <h3 key={i} className="text-base font-semibold mt-3 mb-1">{line.slice(4)}</h3>;
                        }
                        if (line.startsWith("- **")) {
                          return <p key={i} className="ml-4 text-sm leading-relaxed text-muted-foreground">{line}</p>;
                        }
                        if (line.startsWith("- ")) {
                          return <p key={i} className="ml-4 text-sm leading-relaxed text-muted-foreground">{line}</p>;
                        }
                        if (line.trim() === "") return <br key={i} />;
                        return <p key={i} className="text-sm leading-relaxed text-muted-foreground">{line}</p>;
                      })}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            )}
            {!briefSummary && !detailedSummary && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Sparkles className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No summary yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    AI summary will appear here once processing is complete.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Transcript Tab */}
          <TabsContent value="transcript" className="space-y-4">
            {/* Audio Player */}
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <div className="flex-1">
                  <div className="flex h-8 items-center gap-[2px]">
                    {waveformHeights.map((height, i) => {
                      const active = (i / 60) * (meeting.duration_sec ?? 0) <= currentTime;
                      return (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-colors ${
                            active ? "bg-primary" : "bg-muted"
                          }`}
                          style={{ height: `${Math.max(20, height)}%` }}
                        />
                      );
                    })}
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(meeting.duration_sec ?? 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Segments */}
            <div className="space-y-1">
              {segments.map((seg, i) => (
                <FadeIn key={seg.id} delay={i * 0.03}>
                  <div
                    className={`group flex gap-3 rounded-lg p-3 transition-colors ${
                      currentTime >= seg.start_time && currentTime < seg.end_time
                        ? "bg-primary/5 border border-primary/20"
                        : "hover:bg-accent"
                    }`}
                  >
                    <div
                      className="mt-1 h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: seg.speaker_color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: seg.speaker_color }}>
                          {seg.speaker_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(seg.start_time)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
                        {seg.text}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>

            {segments.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Mic className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No transcript available</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Transcript will appear here once the meeting is processed.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Action Items Tab */}
          <TabsContent value="actions" className="space-y-3">
            {meetingActions.map((item, i) => (
              <FadeIn key={item.id} delay={i * 0.05}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-start gap-3 p-4">
                    <button
                      className="mt-0.5 shrink-0"
                      onClick={() => toggleCheck(item.id)}
                    >
                      {checkedItems.has(item.id) ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium ${checkedItems.has(item.id) ? "line-through text-muted-foreground" : ""}`}>
                        {item.description}
                      </p>
                      {item.context && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.context}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge className={`text-[10px] ${PRIORITY_COLORS[item.priority]}`}>
                          {item.priority}
                        </Badge>
                        <div className="flex items-center gap-1.5">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[8px] bg-muted">
                              {getInitials(item.assigned_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {item.assigned_name}
                          </span>
                        </div>
                        {item.due_date && (
                          <span className="text-xs text-muted-foreground">
                            Due {formatDate(item.due_date)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={item.status === "completed" ? "default" : "secondary"}
                      className="text-[10px]"
                    >
                      {item.status.replace("_", " ")}
                    </Badge>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}

            {meetingActions.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ListChecks className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No action items</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Action items will be extracted from the meeting transcript.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Meeting Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add your notes here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[300px] resize-none"
                />
                <div className="mt-3 flex justify-end">
                  <Button size="sm" onClick={() => toast.success("Notes saved!")}>Save Notes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-4">
            {/* New Comment */}
            <Card>
              <CardContent className="flex gap-3 p-4">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    AJ
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[80px] resize-none"
                  />
                  <div className="mt-2 flex justify-end">
                    <Button size="sm" className="gap-1.5" onClick={() => { setCommentText(""); toast.success("Comment added!"); }}>
                      <Send className="h-3.5 w-3.5" />
                      Comment
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comment List */}
            {meetingComments.map((comment, i) => (
              <FadeIn key={comment.id} delay={i * 0.05}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="text-xs bg-muted">
                          {getInitials(comment.user_name || "?")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{comment.user_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.created_at)}
                          </span>
                          {comment.time_reference !== undefined && (
                            <Badge variant="outline" className="text-[10px]">
                              {comment.time_reference}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{comment.content}</p>

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 space-y-3 border-l-2 border-muted pl-4">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex gap-2">
                                <Avatar className="h-6 w-6 shrink-0">
                                  <AvatarFallback className="text-[8px] bg-muted">
                                    {getInitials(reply.user_name || "?")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold">{reply.user_name}</span>
                                    <span className="text-[10px] text-muted-foreground">
                                      {formatDate(reply.created_at)}
                                    </span>
                                  </div>
                                  <p className="mt-0.5 text-xs text-muted-foreground">
                                    {reply.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}

            {meetingComments.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No comments yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Be the first to add a comment.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AnimatedPage>
  );
}
