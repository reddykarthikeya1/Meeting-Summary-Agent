"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Loader2, Copy, Check, Trash2, Settings2, ChevronDown,
  Sparkles, RotateCcw, MessageSquare, Bot, User, Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { API_URL, AI_PROVIDERS } from "@/lib/constants";
import { AnimatedPage } from "@/components/shared/animated-page";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  provider: string;
  model: string;
  timestamp: Date;
  tokensUsed?: number;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  provider: string;
  model: string;
  createdAt: Date;
}

const SYSTEM_PROMPTS = [
  { id: "general", label: "General Assistant", prompt: "You are a helpful AI assistant." },
  { id: "meeting", label: "Meeting Analyst", prompt: "You are an expert meeting analyst. Help analyze meeting transcripts, extract insights, identify action items, and summarize discussions." },
  { id: "coder", label: "Code Assistant", prompt: "You are an expert software engineer. Help with coding questions, debugging, architecture decisions, and code reviews." },
  { id: "writer", label: "Writing Assistant", prompt: "You are a professional writing assistant. Help with emails, documents, reports, and creative writing." },
  { id: "analyst", label: "Data Analyst", prompt: "You are a data analysis expert. Help interpret data, create insights, and suggest visualizations." },
];

export default function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("");
  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPTS[0].prompt);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages]);

  useEffect(() => {
    const currentProvider = AI_PROVIDERS.find((p) => p.id === provider);
    if (currentProvider && currentProvider.models.length > 0 && !model) {
      setModel(currentProvider.models[0]);
    }
  }, [provider]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      provider,
      model,
      createdAt: new Date(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(sessions.length > 1 ? sessions.find((s) => s.id !== id)!.id : null);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    if (!activeSessionId) {
      createNewSession();
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      provider,
      model,
      timestamp: new Date(),
    };

    const currentInput = input.trim();
    setInput("");

    setSessions((prev) =>
      prev.map((s) =>
        s.id === (activeSessionId || prev[0]?.id)
          ? {
              ...s,
              messages: [...s.messages, userMessage],
              title: s.messages.length === 0 ? currentInput.slice(0, 50) : s.title,
            }
          : s
      )
    );

    setLoading(true);
    setStreaming(true);

    try {
      const currentSession = activeSession || sessions[0];
      const allMessages = [...(currentSession?.messages || []), userMessage];

      const res = await fetch(`${API_URL}/api/v1/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          messages: allMessages.map((m) => ({ role: m.role, content: m.content })),
          provider,
          model,
          system_prompt: systemPrompt,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Failed" }));
        throw new Error(err.detail || "Request failed");
      }

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || data.content || "I couldn't generate a response.",
        provider,
        model,
        timestamp: new Date(),
        tokensUsed: data.tokens_used,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === (activeSessionId || prev[0]?.id)
            ? { ...s, messages: [...s.messages, assistantMessage] }
            : s
        )
      );
    } catch (err: unknown) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${err instanceof Error ? err.message : "Failed to get response. Make sure the backend is running and the provider is configured."}`,
        provider,
        model,
        timestamp: new Date(),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === (activeSessionId || prev[0]?.id)
            ? { ...s, messages: [...s.messages, errorMessage] }
            : s
        )
      );
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success("Copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    if (activeSessionId) {
      setSessions((prev) => prev.map((s) => (s.id === activeSessionId ? { ...s, messages: [] } : s)));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const currentProviderModels = AI_PROVIDERS.find((p) => p.id === provider)?.models || [];

  return (
    <AnimatedPage>
      <div className="flex h-[calc(100vh-8rem)] gap-4">
        {/* Sidebar - Sessions */}
        <Card className="hidden w-72 flex-shrink-0 lg:flex">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Chats</CardTitle>
              <Button size="sm" className="gap-1.5" onClick={createNewSession}>
                <MessageSquare className="h-3.5 w-3.5" /> New
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-14rem)]">
              <div className="space-y-1 px-3 pb-3">
                {sessions.length === 0 && (
                  <p className="py-8 text-center text-xs text-muted-foreground">No chats yet. Start a new one!</p>
                )}
                {sessions.map((session) => (
                  <motion.button
                    key={session.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      activeSessionId === session.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    }`}
                    onClick={() => setActiveSessionId(session.id)}
                  >
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 truncate">{session.title}</span>
                    <button
                      className="hidden rounded p-0.5 hover:bg-destructive/10 hover:text-destructive group-hover:block"
                      onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </motion.button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Chat Area */}
        <Card className="flex flex-1 flex-col">
          {/* Chat Header */}
          <CardHeader className="flex-row items-center justify-between space-y-0 border-b py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm">{activeSession?.title || "New Chat"}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {AI_PROVIDERS.find((p) => p.id === provider)?.name} &middot; {model || "default"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Provider Selector */}
              <Select value={provider} onValueChange={(v) => { setProvider(v); setModel(""); }}>
                <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AI_PROVIDERS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Model Selector */}
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="w-[180px] h-8 text-xs"><SelectValue placeholder="Model" /></SelectTrigger>
                <SelectContent>
                  {currentProviderModels.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* System Prompt */}
              <Select value={systemPrompt} onValueChange={setSystemPrompt}>
                <SelectTrigger className="w-[160px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SYSTEM_PROMPTS.map((sp) => (
                    <SelectItem key={sp.id} value={sp.prompt}>{sp.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Clear Chat */}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearChat} title="Clear chat">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="space-y-4 p-4">
              {(!activeSession || activeSession.messages.length === 0) && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">How can I help you?</h3>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    Chat with any configured AI provider. Switch providers and models anytime using the dropdowns above.
                  </p>
                  <div className="mt-6 grid max-w-lg grid-cols-2 gap-2">
                    {[
                      "Summarize my last meeting",
                      "Write a follow-up email",
                      "Debug a React component",
                      "Analyze our Q2 metrics",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        className="rounded-lg border p-3 text-left text-xs transition-colors hover:bg-muted"
                        onClick={() => { setInput(suggestion); }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeSession?.messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[75%] ${msg.role === "user" ? "order-1" : ""}`}>
                    <div className={`rounded-2xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}>
                      <pre className="whitespace-pre-wrap font-sans leading-relaxed">{msg.content}</pre>
                    </div>
                    <div className={`mt-1 flex items-center gap-2 text-[10px] text-muted-foreground ${
                      msg.role === "user" ? "justify-end" : ""
                    }`}>
                      <span>{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      {msg.role === "assistant" && (
                        <>
                          <span>&middot;</span>
                          <span>{AI_PROVIDERS.find((p) => p.id === msg.provider)?.name}</span>
                          <span>&middot;</span>
                          <span>{msg.model}</span>
                          {msg.tokensUsed && (
                            <>
                              <span>&middot;</span>
                              <span>{msg.tokensUsed} tokens</span>
                            </>
                          )}
                        </>
                      )}
                      <button
                        className="ml-1 rounded p-0.5 hover:bg-background"
                        onClick={() => copyMessage(msg.id, msg.content)}
                      >
                        {copiedId === msg.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground order-2">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </motion.div>
              ))}

              {streaming && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="rounded-2xl bg-muted px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                          className="h-2 w-2 rounded-full bg-primary"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Shift+Enter for new line)"
                className="min-h-[44px] max-h-[120px] resize-none"
                rows={1}
              />
              <div className="flex flex-col gap-1">
                <Button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="h-[44px] gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Using {AI_PROVIDERS.find((p) => p.id === provider)?.name} &middot; {model || "default model"} &middot; {SYSTEM_PROMPTS.find((p) => p.prompt === systemPrompt)?.label}
            </p>
          </div>
        </Card>
      </div>
    </AnimatedPage>
  );
}
