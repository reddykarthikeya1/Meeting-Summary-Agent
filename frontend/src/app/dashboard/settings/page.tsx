"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  User, Cpu, Users, Puzzle, Save, Plus, Trash2, Check, Globe,
  MessageCircle, GitBranch, Eye, EyeOff, Loader2, TestTube2,
  ExternalLink, Wifi, WifiOff, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedPage } from "@/components/shared/animated-page";
import { FadeIn } from "@/components/shared/fade-in";
import { StaggerContainer, StaggerItem } from "@/components/shared/stagger-children";
import { currentUser, users } from "@/lib/mock-data";
import { AI_PROVIDERS, API_URL } from "@/lib/constants";
import { getInitials } from "@/lib/utils";

const integrations = [
  { id: "slack", name: "Slack", description: "Get meeting summaries and action items in Slack channels.", icon: MessageCircle, connected: true },
  { id: "google", name: "Google Calendar", description: "Sync meetings with Google Calendar.", icon: Globe, connected: true },
  { id: "github", name: "GitHub", description: "Create issues from action items.", icon: GitBranch, connected: false },
  { id: "notion", name: "Notion", description: "Export meeting notes to Notion.", icon: Globe, connected: false },
];

interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  isConfigured: boolean;
  isTesting: boolean;
  isConnected: boolean | null;
  showKey: boolean;
}

export default function SettingsPage() {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [bio, setBio] = useState("Product-focused engineer passionate about AI-powered tools.");
  const [defaultProvider, setDefaultProvider] = useState("openai");
  const [autoTranscribe, setAutoTranscribe] = useState(true);
  const [autoSummarize, setAutoSummarize] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");

  // Provider configs
  const [providerConfigs, setProviderConfigs] = useState<Record<string, ProviderConfig>>(() => {
    const configs: Record<string, ProviderConfig> = {};
    AI_PROVIDERS.forEach((p) => {
      configs[p.id] = {
        apiKey: "",
        baseUrl: p.id === "qwen" ? "http://localhost:11434/v1" : "",
        model: p.models[0] || "",
        isConfigured: false,
        isTesting: false,
        isConnected: null,
        showKey: false,
      };
    });
    return configs;
  });

  const updateProviderConfig = (id: string, field: keyof ProviderConfig, value: string | boolean | null) => {
    setProviderConfigs((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const testProvider = async (providerId: string) => {
    const config = providerConfigs[providerId];
    updateProviderConfig(providerId, "isTesting", true);
    updateProviderConfig(providerId, "isConnected", null);

    try {
      const res = await fetch(`${API_URL}/api/v1/providers/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: providerId,
          api_key: config.apiKey,
          base_url: config.baseUrl,
          model: config.model,
        }),
      });
      const data = await res.json();
      if (data.success) {
        updateProviderConfig(providerId, "isConnected", true);
        updateProviderConfig(providerId, "isConfigured", true);
        toast.success(`${providerId}: ${data.message}`);
      } else {
        updateProviderConfig(providerId, "isConnected", false);
        toast.error(`${providerId}: ${data.message}`);
      }
    } catch {
      updateProviderConfig(providerId, "isConnected", false);
      toast.error("Could not reach backend. Make sure it's running.");
    } finally {
      updateProviderConfig(providerId, "isTesting", false);
    }
  };

  const saveProviderConfig = async (providerId: string) => {
    const config = providerConfigs[providerId];
    try {
      const res = await fetch(`${API_URL}/api/v1/providers/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: providerId,
          api_key: config.apiKey,
          base_url: config.baseUrl,
          model: config.model,
        }),
      });
      if (!res.ok) throw new Error("Configuration failed");
      updateProviderConfig(providerId, "isConfigured", true);
      toast.success(`${providerId} configured successfully!`);
    } catch {
      toast.error("Failed to save configuration.");
    }
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-muted-foreground">Manage your account, AI providers, team, and integrations.</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" /> Profile</TabsTrigger>
            <TabsTrigger value="ai" className="gap-2"><Cpu className="h-4 w-4" /> AI Providers</TabsTrigger>
            <TabsTrigger value="team" className="gap-2"><Users className="h-4 w-4" /> Team</TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2"><Puzzle className="h-4 w-4" /> Integrations</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <FadeIn>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Personal Information</CardTitle>
                  <CardDescription>Update your profile details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">{getInitials(name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Button variant="outline" size="sm">Change Avatar</Button>
                      <p className="mt-1 text-xs text-muted-foreground">JPG, PNG. Max 2MB.</p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name</label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bio</label>
                    <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
                  </div>
                  <div className="flex justify-end">
                    <Button className="gap-2" onClick={() => toast.success("Profile saved!")}><Save className="h-4 w-4" /> Save Changes</Button>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
            <FadeIn delay={0.1}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Preferences</CardTitle>
                  <CardDescription>Configure your meeting defaults.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-medium">Auto-transcribe meetings</p><p className="text-xs text-muted-foreground">Automatically start transcription when recording begins.</p></div>
                    <Switch checked={autoTranscribe} onCheckedChange={setAutoTranscribe} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-medium">Auto-summarize</p><p className="text-xs text-muted-foreground">Generate AI summary after each meeting.</p></div>
                    <Switch checked={autoSummarize} onCheckedChange={setAutoSummarize} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-medium">Email notifications</p><p className="text-xs text-muted-foreground">Receive meeting summaries and action item reminders.</p></div>
                    <Switch checked={notifications} onCheckedChange={setNotifications} />
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </TabsContent>

          {/* AI Providers Tab — FULLY FUNCTIONAL */}
          <TabsContent value="ai" className="space-y-6">
            <FadeIn>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Default AI Provider</CardTitle>
                  <CardDescription>Choose the default provider for new meetings.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={defaultProvider} onValueChange={setDefaultProvider}>
                    <SelectTrigger className="w-full sm:w-[280px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {AI_PROVIDERS.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </FadeIn>

            <StaggerContainer className="space-y-4">
              {AI_PROVIDERS.map((provider) => {
                const config = providerConfigs[provider.id];
                return (
                  <StaggerItem key={provider.id}>
                    <Card className={provider.id === defaultProvider ? "border-primary" : ""}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-base">{provider.name}</CardTitle>
                            {provider.id === defaultProvider && <Badge className="text-[10px]"><Check className="mr-1 h-3 w-3" /> Default</Badge>}
                            {config.isConfigured && <Badge variant="outline" className="text-[10px] text-emerald-500">Configured</Badge>}
                          </div>
                          <div className="flex items-center gap-2">
                            {config.isConnected === true && <Wifi className="h-4 w-4 text-emerald-500" />}
                            {config.isConnected === false && <WifiOff className="h-4 w-4 text-red-500" />}
                            {provider.keyUrl && (
                              <a href={provider.keyUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>
                        <CardDescription>{provider.models.join(", ")}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* API Key */}
                        {provider.requiresKey && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium">API Key</label>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <Input
                                  type={config.showKey ? "text" : "password"}
                                  placeholder={`Enter ${provider.name} API key`}
                                  value={config.apiKey}
                                  onChange={(e) => updateProviderConfig(provider.id, "apiKey", e.target.value)}
                                />
                                <Button
                                  type="button" variant="ghost" size="icon"
                                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                                  onClick={() => updateProviderConfig(provider.id, "showKey", !config.showKey)}
                                >
                                  {config.showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Base URL (for self-hosted / custom) */}
                        {(provider.id === "qwen" || provider.id === "custom" || provider.id === "openrouter") && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium">Base URL</label>
                            <Input
                              placeholder={provider.id === "qwen" ? "http://localhost:11434/v1" : "https://api.example.com/v1"}
                              value={config.baseUrl}
                              onChange={(e) => updateProviderConfig(provider.id, "baseUrl", e.target.value)}
                            />
                          </div>
                        )}

                        {/* Model Selection */}
                        {provider.models.length > 0 && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium">Model</label>
                            <Select value={config.model} onValueChange={(v) => updateProviderConfig(provider.id, "model", v)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {provider.models.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Custom model input for custom provider */}
                        {provider.id === "custom" && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium">Model Name</label>
                            <Input
                              placeholder="e.g. gpt-4o, llama-3.3-70b"
                              value={config.model}
                              onChange={(e) => updateProviderConfig(provider.id, "model", e.target.value)}
                            />
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline" size="sm" className="gap-1.5"
                            onClick={() => testProvider(provider.id)}
                            disabled={config.isTesting}
                          >
                            {config.isTesting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <TestTube2 className="h-3.5 w-3.5" />}
                            Test Connection
                          </Button>
                          <Button
                            size="sm" className="gap-1.5"
                            onClick={() => saveProviderConfig(provider.id)}
                          >
                            <Save className="h-3.5 w-3.5" />
                            Save
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <FadeIn>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Team Members</CardTitle>
                    <CardDescription>Manage your team and their roles.</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Email address" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-64" />
                    <Button size="sm" className="gap-1.5" onClick={() => { if (inviteEmail) { toast.success(`Invite sent to ${inviteEmail}`); setInviteEmail(""); } }}>
                      <Plus className="h-3.5 w-3.5" /> Invite
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9"><AvatarFallback className="bg-muted text-xs">{getInitials(user.name)}</AvatarFallback></Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-[10px]">{user.role}</Badge>
                          {user.id !== currentUser.id && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => toast.success(`Removed ${user.name}`)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <StaggerContainer className="grid gap-4 sm:grid-cols-2">
              {integrations.map((integration) => {
                const Icon = integration.icon;
                return (
                  <StaggerItem key={integration.id}>
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"><Icon className="h-5 w-5" /></div>
                          <div>
                            <CardTitle className="text-base">{integration.name}</CardTitle>
                            <CardDescription className="text-xs">{integration.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${integration.connected ? "bg-emerald-500" : "bg-zinc-400"}`} />
                            <span className="text-xs text-muted-foreground">{integration.connected ? "Connected" : "Not connected"}</span>
                          </div>
                          <Button variant={integration.connected ? "outline" : "default"} size="sm" onClick={() => toast.success(`${integration.name} ${integration.connected ? "configured" : "connected"}!`)}>
                            {integration.connected ? "Configure" : "Connect"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </TabsContent>
        </Tabs>
      </div>
    </AnimatedPage>
  );
}
