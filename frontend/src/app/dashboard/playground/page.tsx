"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Play, Loader2, Copy, Check, FileText, ListChecks, Wand2,
  Mic, Square, MessageSquare, Zap, Send, RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

type PlaygroundMode = "text" | "record" | "conversation" | "quick";
type TaskType = "summarize" | "extract_actions" | "analyze_topics";

const modeOptions = [
  { id: "text", label: "Text Analysis", icon: FileText, description: "Paste a transcript and analyze it" },
  { id: "record", label: "Live Record", icon: Mic, description: "Record audio and transcribe in real-time" },
  { id: "conversation", label: "Conversation", icon: MessageSquare, description: "Chat with AI about your meeting" },
  { id: "quick", label: "Quick Actions", icon: Zap, description: "One-click summarize, extract, analyze" },
];

export default function PlaygroundPage() {
  const [mode, setMode] = useState<PlaygroundMode>("text");
  const [transcript, setTranscript] = useState("");
  const [provider, setProvider] = useState("openai");
  const [taskType, setTaskType] = useState<TaskType>("summarize");
  const [summaryType, setSummaryType] = useState("brief");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Conversation state
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleRun = async () => {
    if (!transcript.trim()) { toast.error("Please enter a transcript."); return; }
    setLoading(true); setResult("");
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
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({ detail: "Failed" })); throw new Error(err.detail); }
      const data = await res.json();
      setResult(data.result || data.summary || JSON.stringify(data.action_items || data.topics, null, 2));
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : "Request failed"); }
    finally { setLoading(false); }
  };

  const handleQuickAction = async (action: TaskType) => {
    if (!transcript.trim()) { toast.error("Enter a transcript first."); return; }
    setTaskType(action);
    setLoading(true); setResult("");
    try {
      const endpoint = action === "summarize"
        ? `${API_URL}/api/v1/meetings/playground/summarize`
        : action === "extract_actions"
        ? `${API_URL}/api/v1/meetings/playground/extract-actions`
        : `${API_URL}/api/v1/meetings/playground/analyze-topics`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        body: JSON.stringify({ transcript, provider, summary_type: "brief" }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setResult(data.result || data.summary || JSON.stringify(data.action_items || data.topics, null, 2));
    } catch { toast.error("Request failed."); }
    finally { setLoading(false); }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      toast.success(`Recording stopped. ${recordingTime}s captured.`);
    } else {
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
      toast.success("Recording started...");
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);
    try {
      const context = transcript ? `\n\nMeeting transcript context:\n${transcript.slice(0, 2000)}` : "";
      const res = await fetch(`${API_URL}/api/v1/meetings/playground/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
        body: JSON.stringify({
          transcript: `User question: ${userMsg}${context}`,
          provider,
          summary_type: "brief",
        }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.result || data.summary || "I couldn't process that." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally { setChatLoading(false); }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true); toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Playground</h1>
            <p className="text-muted-foreground">Test AI capabilities with multiple modes.</p>
          </div>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {AI_PROVIDERS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {modeOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button key={opt.id} onClick={() => setMode(opt.id as PlaygroundMode)} className={`rounded-lg border p-4 text-left transition-all hover:shadow-md ${mode === opt.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/50"}`}>
                <Icon className={`h-5 w-5 mb-2 ${mode === opt.id ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-sm font-medium">{opt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
              </button>
            );
          })}
        </div>

        {/* Text Analysis Mode */}
        {mode === "text" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Input</CardTitle>
                <CardDescription>Paste a meeting transcript or use the sample</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-sm font-medium">Task</label>
                    <Select value={taskType} onValueChange={(v) => setTaskType(v as TaskType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summarize">Summarize</SelectItem>
                        <SelectItem value="extract_actions">Extract Actions</SelectItem>
                        <SelectItem value="analyze_topics">Analyze Topics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {taskType === "summarize" && (
                    <div className="flex-1 space-y-1.5">
                      <label className="text-sm font-medium">Summary Type</label>
                      <Select value={summaryType} onValueChange={setSummaryType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brief">Brief</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                          <SelectItem value="bullet_points">Bullet Points</SelectItem>
                          <SelectItem value="executive">Executive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Transcript</label>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => setTranscript(SAMPLE_TRANSCRIPT)}>Load Sample</Button>
                  </div>
                  <Textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Paste your meeting transcript here..." className="min-h-[300px] font-mono text-sm" />
                  <p className="text-xs text-muted-foreground">{transcript.length} chars ~ {Math.ceil(transcript.length / 4)} tokens</p>
                </div>
                <Button className="w-full gap-2" onClick={handleRun} disabled={loading || !transcript.trim()}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  {loading ? "Processing..." : "Run Analysis"}
                </Button>
              </CardContent>
            </Card>
            <OutputPanel result={result} loading={loading} provider={provider} copyResult={copyResult} copied={copied} />
          </div>
        )}

        {/* Live Record Mode */}
        {mode === "record" && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-6 py-8">
                <motion.button onClick={toggleRecording} className={`relative flex h-32 w-32 items-center justify-center rounded-full transition-colors ${isRecording ? "bg-red-500 text-white" : "bg-primary text-primary-foreground"}`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  {isRecording && <motion.div className="absolute inset-0 rounded-full bg-red-500" animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />}
                  {isRecording ? <Square className="h-10 w-10 relative z-10" /> : <Mic className="h-10 w-10" />}
                </motion.button>
                {isRecording && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                    <p className="text-4xl font-mono font-bold">{formatTime(recordingTime)}</p>
                    <p className="text-sm text-muted-foreground mt-1">Recording in progress...</p>
                    <div className="mt-4 flex items-end justify-center gap-1 h-12">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div key={i} className="w-1.5 bg-primary rounded-full" animate={{ height: [4, Math.random() * 40 + 8, 4] }} transition={{ duration: 0.5 + Math.random() * 0.5, repeat: Infinity, delay: i * 0.05 }} />
                      ))}
                    </div>
                  </motion.div>
                )}
                {!isRecording && recordingTime > 0 && (
                  <div className="w-full max-w-2xl space-y-4">
                    <div className="rounded-lg border p-4">
                      <p className="text-sm font-medium mb-2">Recording Complete</p>
                      <p className="text-xs text-muted-foreground">Duration: {formatTime(recordingTime)}. In production, the transcript would appear here from real-time speech-to-text.</p>
                    </div>
                    <div className="flex gap-3">
                      <Button className="flex-1 gap-2" onClick={() => { setTranscript(SAMPLE_TRANSCRIPT); handleQuickAction("summarize"); }}>
                        <Sparkles className="h-4 w-4" /> Generate Summary
                      </Button>
                      <Button variant="outline" className="gap-2" onClick={() => { setRecordingTime(0); setResult(""); }}>
                        <RotateCcw className="h-4 w-4" /> Reset
                      </Button>
                    </div>
                    {result && <div className="rounded-lg border bg-muted/50 p-4"><pre className="whitespace-pre-wrap text-sm">{result}</pre></div>}
                  </div>
                )}
                {!isRecording && recordingTime === 0 && (
                  <div className="text-center text-muted-foreground">
                    <p className="text-sm">Click the button to start recording a meeting.</p>
                    <p className="text-xs mt-1">Real-time transcription will appear here.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conversation Mode */}
        {mode === "conversation" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Chat with AI</CardTitle>
                <CardDescription>Ask questions about your meeting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-[400px] overflow-y-auto rounded-lg border p-4 space-y-4">
                    {messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mb-2" />
                        <p className="text-sm">Start a conversation about your meeting</p>
                        <p className="text-xs mt-1">Try: "Summarize the key decisions" or "What action items were assigned?"</p>
                      </div>
                    )}
                    {messages.map((msg, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                          <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
                        </div>
                      </motion.div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg px-4 py-2.5">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <motion.span key={i} animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }} className="h-2 w-2 rounded-full bg-primary" />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="flex gap-2">
                    <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask about the meeting..." onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()} />
                    <Button onClick={handleSendMessage} disabled={chatLoading || !chatInput.trim()}><Send className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Context</CardTitle>
                <CardDescription>Paste transcript for context</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setTranscript(SAMPLE_TRANSCRIPT)}>Load Sample</Button>
                  <Textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Paste transcript here..." className="min-h-[300px] text-xs font-mono" />
                  <p className="text-xs text-muted-foreground">{transcript.length} chars loaded</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions Mode */}
        {mode === "quick" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" /> Quick Actions</CardTitle>
                <CardDescription>Paste a transcript and run one-click AI analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setTranscript(SAMPLE_TRANSCRIPT)}>Load Sample</Button>
                  <p className="text-xs text-muted-foreground">{transcript.length} chars</p>
                </div>
                <Textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Paste your meeting transcript here..." className="min-h-[200px] font-mono text-sm" />
              </CardContent>
            </Card>
            <div className="grid gap-4 sm:grid-cols-3">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleQuickAction("summarize")}>
                  <CardContent className="pt-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                      <FileText className="h-6 w-6 text-blue-500" />
                    </div>
                    <h3 className="font-medium">Summarize</h3>
                    <p className="text-xs text-muted-foreground mt-1">Generate a brief summary</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleQuickAction("extract_actions")}>
                  <CardContent className="pt-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                      <ListChecks className="h-6 w-6 text-emerald-500" />
                    </div>
                    <h3 className="font-medium">Extract Actions</h3>
                    <p className="text-xs text-muted-foreground mt-1">Find all action items</p>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => handleQuickAction("analyze_topics")}>
                  <CardContent className="pt-6 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-violet-500/10">
                      <Sparkles className="h-6 w-6 text-violet-500" />
                    </div>
                    <h3 className="font-medium">Analyze Topics</h3>
                    <p className="text-xs text-muted-foreground mt-1">Identify key topics</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            {loading && (
              <div className="flex items-center justify-center gap-3 py-8">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Processing with {AI_PROVIDERS.find((p) => p.id === provider)?.name}...</span>
              </div>
            )}
            {result && <OutputPanel result={result} loading={false} provider={provider} copyResult={copyResult} copied={copied} />}
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}

function OutputPanel({ result, loading, provider, copyResult, copied }: {
  result: string; loading: boolean; provider: string; copyResult: () => void; copied: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" /> Output</CardTitle>
          {result && (
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={copyResult}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Processing with {AI_PROVIDERS.find((p) => p.id === provider)?.name}...</p>
          </div>
        ) : result ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">{result}</pre>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Wand2 className="h-8 w-8 mb-3" />
            <p className="text-sm">Results will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
