"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  ArrowLeft,
  Mic,
  Upload,
  StopCircle,
  Play,
  Pause,
  Zap,
  Users,
  FolderOpen,
  Lightbulb,
  UserCheck,
  Phone,
  FileAudio,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatedPage } from "@/components/shared/animated-page";
import { FadeIn } from "@/components/shared/fade-in";
import { GlassCard } from "@/components/shared/glass-card";
import { templates } from "@/lib/mock-data";
import { formatTime } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  Zap,
  Users,
  FolderOpen,
  Lightbulb,
  UserCheck,
  Phone,
};

export default function NewMeetingPage() {
  const [mode, setMode] = useState<"record" | "upload">("record");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [waveformHeights] = useState(() =>
    Array.from({ length: 40 }, () => Math.random() * 100)
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "audio/*": [".mp3", ".wav", ".m4a", ".ogg", ".webm"] },
    maxFiles: 1,
  });

  // Simulate recording timer
  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    const interval = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);
    // Store interval for cleanup (simplified)
    (window as any).__recordingInterval = interval;
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    if ((window as any).__recordingInterval) {
      clearInterval((window as any).__recordingInterval);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Link href="/meetings">
            <Button variant="ghost" size="icon" className="mt-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">New Meeting</h1>
            <p className="mt-1 text-muted-foreground">
              Record a live meeting or upload an audio file.
            </p>
          </div>
        </div>

        {/* Meeting Title */}
        <FadeIn>
          <div className="space-y-2">
            <label className="text-sm font-medium">Meeting Title</label>
            <Input
              placeholder="Enter meeting title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg"
            />
          </div>
        </FadeIn>

        {/* Template Selector */}
        <FadeIn delay={0.05}>
          <div className="space-y-2">
            <label className="text-sm font-medium">Template (optional)</label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select a meeting template..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map((tmpl) => {
                  const Icon = iconMap[tmpl.icon] || Zap;
                  return (
                    <SelectItem key={tmpl.id} value={tmpl.id}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {tmpl.name}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </FadeIn>

        {/* Mode Toggle */}
        <FadeIn delay={0.1}>
          <div className="flex gap-3">
            <Button
              variant={mode === "record" ? "default" : "outline"}
              onClick={() => setMode("record")}
              className="flex-1 gap-2"
            >
              <Mic className="h-4 w-4" />
              Record
            </Button>
            <Button
              variant={mode === "upload" ? "default" : "outline"}
              onClick={() => setMode("upload")}
              className="flex-1 gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </div>
        </FadeIn>

        {/* Record Mode */}
        <AnimatePresence mode="wait">
          {mode === "record" ? (
            <motion.div
              key="record"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="p-8">
                <div className="flex flex-col items-center">
                  {/* Timer */}
                  <div className="mb-6 text-5xl font-bold tabular-nums tracking-tight">
                    {formatTime(duration)}
                  </div>

                  {/* Waveform */}
                  <div className="mb-8 flex h-20 w-full max-w-md items-end justify-center gap-[3px]">
                    {waveformHeights.map((h, i) => (
                      <motion.div
                        key={i}
                        className="w-2 rounded-full bg-primary/30"
                        animate={
                          isRecording && !isPaused
                            ? {
                                height: [
                                  `${Math.max(15, h * 0.4)}%`,
                                  `${Math.max(20, h)}%`,
                                  `${Math.max(15, h * 0.6)}%`,
                                ],
                              }
                            : { height: `${Math.max(8, h * 0.15)}%` }
                        }
                        transition={
                          isRecording && !isPaused
                            ? {
                                duration: 0.5 + Math.random() * 0.5,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut",
                              }
                            : { duration: 0.3 }
                        }
                      />
                    ))}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-4">
                    {!isRecording ? (
                      <Button
                        size="lg"
                        className="gap-2 rounded-full px-8"
                        onClick={startRecording}
                      >
                        <div className="relative">
                          <Mic className="h-5 w-5" />
                          <motion.div
                            className="absolute inset-0 rounded-full bg-primary-foreground/20"
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                        </div>
                        Start Recording
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="lg"
                          className="gap-2 rounded-full px-6"
                          onClick={togglePause}
                        >
                          {isPaused ? (
                            <Play className="h-5 w-5" />
                          ) : (
                            <Pause className="h-5 w-5" />
                          )}
                          {isPaused ? "Resume" : "Pause"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="lg"
                          className="gap-2 rounded-full px-6"
                          onClick={stopRecording}
                        >
                          <StopCircle className="h-5 w-5" />
                          Stop
                        </Button>
                      </>
                    )}
                  </div>

                  {isRecording && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 flex items-center gap-2"
                    >
                      <motion.div
                        className="h-2 w-2 rounded-full bg-red-500"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {isPaused ? "Paused" : "Recording in progress..."}
                      </span>
                    </motion.div>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {!uploadedFile ? (
                <div
                  {...getRootProps()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent"
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="mb-4 rounded-full bg-muted p-4">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-base font-medium">
                    {isDragActive ? "Drop your audio file here" : "Drag and drop your audio file"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    or click to browse. Supports MP3, WAV, M4A, OGG, WebM.
                  </p>
                </div>
              ) : (
                <GlassCard className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                      <FileAudio className="h-7 w-7 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setUploadedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload and Process
                    </Button>
                  </div>
                </GlassCard>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedPage>
  );
}
