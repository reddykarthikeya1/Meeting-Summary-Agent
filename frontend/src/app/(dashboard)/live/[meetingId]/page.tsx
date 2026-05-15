"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mic,
  MicOff,
  Pause,
  Play,
  StopCircle,
  MessageSquare,
  StickyNote,
  Users,
  Clock,
  Maximize2,
  Minimize2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatTime, getInitials } from "@/lib/utils";

const liveParticipants = [
  { name: "Alex Johnson", color: "#6366f1" },
  { name: "Sarah Chen", color: "#ec4899" },
  { name: "Mike Williams", color: "#f59e0b" },
];

const liveTranscript = [
  { speaker: "Alex Johnson", text: "Alright everyone, let's get started with today's agenda.", time: 0 },
  { speaker: "Sarah Chen", text: "Sounds good. I have updates on the design system progress.", time: 12 },
  { speaker: "Mike Williams", text: "I can share the performance benchmarks after Sarah.", time: 25 },
  { speaker: "Alex Johnson", text: "Perfect. Sarah, you have the floor.", time: 32 },
  { speaker: "Sarah Chen", text: "So the component library is now at 95% coverage. We've standardized all the form inputs, buttons, and card components.", time: 40 },
  { speaker: "Sarah Chen", text: "The only remaining piece is the date picker, which needs some accessibility improvements.", time: 55 },
  { speaker: "Mike Williams", text: "That's great progress. On my end, the N+1 query fix reduced page load time from 3.2 seconds to 0.8 seconds.", time: 68 },
  { speaker: "Alex Johnson", text: "That's a massive improvement. What was the main optimization?", time: 80 },
  { speaker: "Mike Williams", text: "Batch loading with a single JOIN query instead of individual lookups for each meeting's participants.", time: 88 },
];

export default function LiveMeetingPage() {
  const params = useParams();
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [notes, setNotes] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [waveformHeights] = useState(() =>
    Array.from({ length: 50 }, () => Math.random() * 100)
  );

  useEffect(() => {
    if (!isRecording || isPaused) return;
    const interval = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const handleStop = () => {
    setIsRecording(false);
    router.push(`/meetings/${params.meetingId}`);
  };

  return (
    <div className={`-m-4 lg:-m-8 ${isFullscreen ? "-m-4 lg:-m-8" : ""}`}>
      <div className="flex h-[calc(100vh-4rem)] flex-col bg-background">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isRecording && (
                <motion.div
                  className="h-3 w-3 rounded-full bg-red-500"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              <Badge variant={isRecording ? "destructive" : "secondary"}>
                {isRecording ? (isPaused ? "Paused" : "Recording") : "Stopped"}
              </Badge>
            </div>
            <h1 className="text-lg font-semibold">Sprint 24 Planning</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-2xl font-bold tabular-nums">
              <Clock className="h-5 w-5 text-muted-foreground" />
              {formatTime(duration)}
            </div>
            <div className="flex items-center gap-1">
              <Avatar className="h-7 w-7 border-2 border-background">
                <AvatarFallback className="text-[9px] bg-blue-500/10 text-blue-500">
                  {getInitials("Alex Johnson")}
                </AvatarFallback>
              </Avatar>
              <Avatar className="h-7 w-7 border-2 border-background">
                <AvatarFallback className="text-[9px] bg-pink-500/10 text-pink-500">
                  {getInitials("Sarah Chen")}
                </AvatarFallback>
              </Avatar>
              <Avatar className="h-7 w-7 border-2 border-background">
                <AvatarFallback className="text-[9px] bg-amber-500/10 text-amber-500">
                  {getInitials("Mike Williams")}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Transcript Panel */}
          <div className="flex flex-1 flex-col">
            {/* Waveform */}
            <div className="border-b border-border px-6 py-4">
              <div className="flex h-16 items-center justify-center gap-[2px]">
                {waveformHeights.map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 rounded-full"
                    animate={
                      isRecording && !isPaused
                        ? {
                            height: [`${Math.max(15, h * 0.3)}%`, `${Math.max(20, h)}%`, `${Math.max(15, h * 0.5)}%`],
                            backgroundColor: ["hsl(239, 84%, 67%)", "hsl(239, 84%, 77%)", "hsl(239, 84%, 67%)"],
                          }
                        : { height: `${Math.max(8, h * 0.1)}%`, backgroundColor: "hsl(var(--muted))" }
                    }
                    transition={
                      isRecording && !isPaused
                        ? { duration: 0.4 + Math.random() * 0.4, repeat: Infinity, repeatType: "reverse" }
                        : { duration: 0.3 }
                    }
                  />
                ))}
              </div>
            </div>

            {/* Live Transcript */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-3">
                {liveTranscript.map((segment, i) => {
                  const participant = liveParticipants.find((p) => p.name === segment.speaker);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex gap-3"
                    >
                      <div
                        className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: participant?.color || "#888" }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: participant?.color }}
                          >
                            {segment.speaker}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(segment.time)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
                          {segment.text}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Typing indicator for current speaker */}
                {isRecording && !isPaused && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 pl-6"
                  >
                    <div className="flex gap-1">
                      <motion.div
                        className="h-1.5 w-1.5 rounded-full bg-primary"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="h-1.5 w-1.5 rounded-full bg-primary"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="h-1.5 w-1.5 rounded-full bg-primary"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">Listening...</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="border-t border-border px-6 py-4">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant={isMuted ? "destructive" : "outline"}
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={() => setIsPaused(!isPaused)}
                >
                  {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  className="gap-2 rounded-full px-8"
                  onClick={handleStop}
                >
                  <StopCircle className="h-5 w-5" />
                  Stop Recording
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Side Panel - Notes */}
          <div className="hidden w-80 border-l border-border lg:block">
            <div className="flex h-full flex-col">
              <div className="border-b border-border px-4 py-3">
                <h3 className="text-sm font-semibold">Meeting Notes</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <Textarea
                  placeholder="Take notes during the meeting..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[200px] resize-none border-0 p-0 focus-visible:ring-0"
                />
              </div>
              <div className="border-t border-border p-4">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Quick Actions</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                      Add action item
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                      Mark important
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                      Add bookmark
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
