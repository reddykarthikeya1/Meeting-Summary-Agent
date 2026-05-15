"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Play,
  Loader2,
  Copy,
  Check,
  FileText,
  ListChecks,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { API_URL, AI_PROVIDERS } from "@/lib/constants";
import { AnimatedPage } from "@/components/shared/animated-page";

const SAMPLE_TRANSCRIPT = `[00:00] Sarah: Good morning everyone. Let's start with the Q2 roadmap update.
[00:15] Mike: Sure. We've completed the authentication module and the API is live.
[00:30] Sarah: Great. What's next on the pipeline?
[00:45] Mike: We need to start the payments integration. I'll take that.
[01:00] Emily: I can help with the frontend components for payments.
[01:15] Sarah: Perfect. Mike, can you have the API ready by next Friday?
[01:30] Mike: Yes, I'll have it done by Thursday.
[01:45] Sarah: Also, we need to fix the search bug. David, can you look into it?
[02:00] David: Sure, I'll investigate today and push a fix by tomorrow.
[02:15] Sarah: Great. Let's also schedule a design review for Wednesday.
[02:30] Emily: I'll set that up and send invites.
[02:45] Sarah: One more thing - we need to update the documentation before the release.
[03:00] Mike: I'll add that to my tasks for this week.
[03:15] Sarah: Thanks everyone. Let's reconvene on Friday.`;

type TaskType = "summarize" | "extract_actions" | "analyze_topics";

export default function PlaygroundPage() {
  const [transcript, setTranscript] = useState("");
  const [provider, setProvider] = useState("openai");
  const [taskType, setTaskType] = useState<TaskType>("summarize");
  const [summaryType, setSummaryType] = useState("brief");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const handleRun = async () => {
    if (!transcript.trim()) {
      toast.error("Please enter a transcript.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const endpoint = taskType === "summarize"
        ? `${API_URL}/api/v1/meetings/playground/summarize`
        : taskType === "extract_actions"
        ? `${API_URL}/api/v1/meetings/playground/extract-actions`
        : `${API_URL}/api/v1/meetings/playground/analyze-topics`;

      const body = taskType === "summarize"
        ? { transcript, provider, summary_type: summaryType }
        : { transcript, provider };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Request failed" }));
        throw new Error(err.detail || "Request failed");
      }

      const data = await res.json();
      setResult(data.result || data.summary || JSON.stringify(data.action_items || data.topics, null, 2));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Playground</h1>
          <p className="text-muted-foreground">
            Test transcription, summarization, and action item extraction with your configured AI providers.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Input
              </CardTitle>
              <CardDescription>Paste a meeting transcript or use the sample</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1 space-y-1.5">
                  <label className="text-sm font-medium">AI Provider</label>
                  <Select value={provider} onValueChange={setProvider}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_PROVIDERS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className="text-sm font-medium">Task</label>
                  <Select value={taskType} onValueChange={(v) => setTaskType(v as TaskType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summarize">Summarize</SelectItem>
                      <SelectItem value="extract_actions">Extract Actions</SelectItem>
                      <SelectItem value="analyze_topics">Analyze Topics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {taskType === "summarize" && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Summary Type</label>
                  <Select value={summaryType} onValueChange={setSummaryType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brief">Brief</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="bullet_points">Bullet Points</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Transcript</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => setTranscript(SAMPLE_TRANSCRIPT)}
                  >
                    Load Sample
                  </Button>
                </div>
                <Textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste your meeting transcript here..."
                  className="min-h-[300px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  {transcript.length} chars ~ {Math.ceil(transcript.length / 4)} tokens
                </p>
              </div>

              <Button className="w-full gap-2" onClick={handleRun} disabled={loading || !transcript.trim()}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {loading ? "Processing..." : "Run"}
              </Button>
            </CardContent>
          </Card>

          {/* Output Panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Output
                </CardTitle>
                {result && (
                  <Button variant="ghost" size="sm" className="gap-1.5" onClick={copyResult}>
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                )}
              </div>
              <CardDescription>AI-generated results will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Processing with {AI_PROVIDERS.find((p) => p.id === provider)?.name}...
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    This may take a moment for long transcripts
                  </p>
                </div>
              ) : result ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="prose prose-sm dark:prose-invert max-w-none"
                >
                  <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">{result}</pre>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                  <Wand2 className="h-8 w-8 mb-3" />
                  <p className="text-sm">Enter a transcript and click Run to see results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                </div>
                <h3 className="font-medium">Summarization</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Generate brief, detailed, bullet-point, or executive summaries from meeting transcripts.
                Long transcripts are automatically chunked for small context models.
              </p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-emerald-500/10 p-2">
                  <ListChecks className="h-4 w-4 text-emerald-500" />
                </div>
                <h3 className="font-medium">Action Extraction</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Automatically identify tasks, assignees, priorities, and due dates from meeting discussions.
                Results are deduplicated across chunks.
              </p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-violet-500/10 p-2">
                  <Sparkles className="h-4 w-4 text-violet-500" />
                </div>
                <h3 className="font-medium">Smart Chunking</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Long transcripts are split into overlapping chunks that fit each model&apos;s context window.
                Results are merged automatically for coherent output.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedPage>
  );
}
