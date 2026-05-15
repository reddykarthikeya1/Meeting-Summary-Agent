"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  User,
  Cpu,
  Users,
  Puzzle,
  Save,
  Plus,
  Trash2,
  Check,
  Globe,
  MessageCircle,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AnimatedPage } from "@/components/shared/animated-page";
import { FadeIn } from "@/components/shared/fade-in";
import { StaggerContainer, StaggerItem } from "@/components/shared/stagger-children";
import { currentUser, users } from "@/lib/mock-data";
import { AI_PROVIDERS } from "@/lib/constants";
import { getInitials } from "@/lib/utils";

const integrations = [
  { id: "slack", name: "Slack", description: "Get meeting summaries and action items in Slack channels.", icon: MessageCircle, connected: true },
  { id: "google", name: "Google Calendar", description: "Sync meetings with Google Calendar.", icon: Globe, connected: true },
  { id: "github", name: "GitHub", description: "Create issues from action items.", icon: GitBranch, connected: false },
  { id: "notion", name: "Notion", description: "Export meeting notes to Notion.", icon: Globe, connected: false },
];

export default function SettingsPage() {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [bio, setBio] = useState("Product-focused engineer passionate about AI-powered tools.");
  const [defaultProvider, setDefaultProvider] = useState("openai");
  const [autoTranscribe, setAutoTranscribe] = useState(true);
  const [autoSummarize, setAutoSummarize] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <AnimatedPage>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your account, AI providers, team, and integrations.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Cpu className="h-4 w-4" />
              AI Providers
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Puzzle className="h-4 w-4" />
              Integrations
            </TabsTrigger>
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
                      <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                        {getInitials(name)}
                      </AvatarFallback>
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
                    <Button className="gap-2" onClick={() => toast.success("Profile saved!")}>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
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
                    <div>
                      <p className="text-sm font-medium">Auto-transcribe meetings</p>
                      <p className="text-xs text-muted-foreground">Automatically start transcription when recording begins.</p>
                    </div>
                    <Switch checked={autoTranscribe} onCheckedChange={setAutoTranscribe} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Auto-summarize</p>
                      <p className="text-xs text-muted-foreground">Generate AI summary after each meeting.</p>
                    </div>
                    <Switch checked={autoSummarize} onCheckedChange={setAutoSummarize} />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Email notifications</p>
                      <p className="text-xs text-muted-foreground">Receive meeting summaries and action item reminders.</p>
                    </div>
                    <Switch checked={notifications} onCheckedChange={setNotifications} />
                  </div>
                </CardContent>
              </Card>
            </FadeIn>
          </TabsContent>

          {/* AI Providers Tab */}
          <TabsContent value="ai" className="space-y-6">
            <FadeIn>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Default AI Provider</CardTitle>
                  <CardDescription>Choose the AI provider for transcription and summarization.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={defaultProvider} onValueChange={setDefaultProvider}>
                    <SelectTrigger className="w-full sm:w-[280px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_PROVIDERS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </FadeIn>

            <StaggerContainer className="grid gap-4 sm:grid-cols-2">
              {AI_PROVIDERS.map((provider) => (
                <StaggerItem key={provider.id}>
                  <Card className={provider.id === defaultProvider ? "border-primary" : ""}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{provider.name}</CardTitle>
                        {provider.id === defaultProvider && (
                          <Badge className="text-[10px]">
                            <Check className="mr-1 h-3 w-3" />
                            Default
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Available Models</p>
                        <div className="flex flex-wrap gap-1.5">
                          {provider.models.map((model) => (
                            <Badge key={model} variant="outline" className="text-[10px]">
                              {model}
                            </Badge>
                          ))}
                        </div>
                        <div className="pt-2">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="text-xs text-muted-foreground">Connected</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </StaggerItem>
              ))}
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
                  <Button size="sm" className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    Invite
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-muted text-xs">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-[10px]">
                            {user.role}
                          </Badge>
                          {user.id !== currentUser.id && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
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
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{integration.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {integration.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${integration.connected ? "bg-emerald-500" : "bg-zinc-400"}`} />
                            <span className="text-xs text-muted-foreground">
                              {integration.connected ? "Connected" : "Not connected"}
                            </span>
                          </div>
                          <Button variant={integration.connected ? "outline" : "default"} size="sm">
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
