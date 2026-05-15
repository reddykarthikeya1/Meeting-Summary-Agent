"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Database,
  Sparkles,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  TestTube2,
  Mic,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { API_URL, AI_PROVIDERS } from "@/lib/constants";

const steps = [
  { id: 1, title: "Database", icon: Database, description: "Configure your PostgreSQL connection" },
  { id: 2, title: "AI Providers", icon: Sparkles, description: "Connect your AI providers" },
  { id: 3, title: "Admin Account", icon: UserCheck, description: "Set up your admin credentials" },
];

export default function SetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  // Database
  const [dbHost, setDbHost] = useState("localhost");
  const [dbPort, setDbPort] = useState("5432");
  const [dbUser, setDbUser] = useState("postgres");
  const [dbPassword, setDbPassword] = useState("postgres");
  const [dbName, setDbName] = useState("meetai");

  // AI Providers
  const [providerKeys, setProviderKeys] = useState<Record<string, { key: string; baseUrl: string; model: string }>>({});

  // Admin
  const [adminName, setAdminName] = useState("Admin");
  const [adminEmail, setAdminEmail] = useState("admin@meetai.com");
  const [adminPassword, setAdminPassword] = useState("Meetai@2026");

  const testDatabase = async () => {
    setTesting(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/setup/test-database`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host: dbHost, port: parseInt(dbPort), user: dbUser, password: dbPassword, database: dbName }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Could not reach backend. Make sure it's running.");
    } finally {
      setTesting(false);
    }
  };

  const testProvider = async (providerId: string) => {
    const config = providerKeys[providerId] || { key: "", baseUrl: "", model: "" };
    setTesting(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/providers/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: providerId, api_key: config.key, base_url: config.baseUrl, model: config.model }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${providerId}: ${data.message}`);
      } else {
        toast.error(`${providerId}: ${data.message}`);
      }
    } catch {
      toast.error("Could not reach backend.");
    } finally {
      setTesting(false);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const aiProviders = Object.entries(providerKeys)
        .filter(([_, v]) => v.key || v.baseUrl)
        .map(([provider, v]) => ({ provider, api_key: v.key, base_url: v.baseUrl, model: v.model }));

      const res = await fetch(`${API_URL}/api/v1/setup/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          database: { host: dbHost, port: parseInt(dbPort), user: dbUser, password: dbPassword, database: dbName },
          ai_providers: aiProviders,
          admin_name: adminName,
          admin_email: adminEmail,
          admin_password: adminPassword,
        }),
      });

      if (!res.ok) throw new Error("Configuration failed");
      toast.success("Setup complete! Redirecting to login...");
      router.push("/login");
    } catch {
      toast.error("Failed to save configuration.");
    } finally {
      setLoading(false);
    }
  };

  const updateProviderKey = (id: string, field: string, value: string) => {
    setProviderKeys((prev) => ({
      ...prev,
      [id]: { key: "", baseUrl: "", model: "", ...prev[id], [field]: value },
    }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Mic className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold">MeetAI Setup</h1>
          <p className="mt-1 text-muted-foreground">Configure your application in a few steps</p>
        </div>

        {/* Step indicators */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  currentStep > step.id
                    ? "bg-emerald-500 text-white"
                    : currentStep === step.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step.id ? <CheckCircle2 className="h-4 w-4" /> : step.id}
              </div>
              <span className={`text-sm ${currentStep === step.id ? "font-medium" : "text-muted-foreground"}`}>
                {step.title}
              </span>
              {i < steps.length - 1 && <div className="mx-2 h-px w-8 bg-border" />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].title}</CardTitle>
              <CardDescription>{steps[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 1: Database */}
              {currentStep === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Host</label>
                      <Input value={dbHost} onChange={(e) => setDbHost(e.target.value)} placeholder="localhost" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Port</label>
                      <Input value={dbPort} onChange={(e) => setDbPort(e.target.value)} placeholder="5432" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Database Name</label>
                    <Input value={dbName} onChange={(e) => setDbName(e.target.value)} placeholder="meetai" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Username</label>
                      <Input value={dbUser} onChange={(e) => setDbUser(e.target.value)} placeholder="postgres" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Password</label>
                      <Input type="password" value={dbPassword} onChange={(e) => setDbPassword(e.target.value)} />
                    </div>
                  </div>
                  <Button variant="outline" className="gap-2" onClick={testDatabase} disabled={testing}>
                    {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube2 className="h-4 w-4" />}
                    Test Connection
                  </Button>
                </>
              )}

              {/* Step 2: AI Providers */}
              {currentStep === 2 && (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  <p className="text-sm text-muted-foreground">
                    Configure at least one AI provider. You can add more later in Settings.
                  </p>
                  {AI_PROVIDERS.filter((p) => p.requiresKey).map((provider) => (
                    <div key={provider.id} className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{provider.name}</p>
                          <p className="text-xs text-muted-foreground">{provider.models.slice(0, 2).join(", ")}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={() => testProvider(provider.id)}
                          disabled={testing}
                        >
                          <TestTube2 className="h-3 w-3" />
                          Test
                        </Button>
                      </div>
                      <Input
                        type="password"
                        placeholder="API Key"
                        value={providerKeys[provider.id]?.key || ""}
                        onChange={(e) => updateProviderKey(provider.id, "key", e.target.value)}
                      />
                    </div>
                  ))}

                  <div className="rounded-lg border border-dashed p-4 space-y-3">
                    <p className="font-medium">Self-Hosted / Custom</p>
                    <Input
                      placeholder="Base URL (e.g. http://localhost:11434/v1)"
                      value={providerKeys.qwen?.baseUrl || ""}
                      onChange={(e) => updateProviderKey("qwen", "baseUrl", e.target.value)}
                    />
                    <Input
                      placeholder="Model name (e.g. qwen3-30b-a3b)"
                      value={providerKeys.qwen?.model || ""}
                      onChange={(e) => updateProviderKey("qwen", "model", e.target.value)}
                    />
                    <Button size="sm" variant="outline" className="gap-1.5" onClick={() => testProvider("qwen")} disabled={testing}>
                      <TestTube2 className="h-3 w-3" />
                      Test
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Admin Account */}
              {currentStep === 3 && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Admin Name</label>
                    <Input value={adminName} onChange={(e) => setAdminName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Admin Email</label>
                    <Input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Admin Password</label>
                    <Input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} />
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                    <p>These credentials will be used to log in to the application.</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {currentStep < 3 ? (
            <Button className="gap-2" onClick={() => setCurrentStep((s) => s + 1)}>
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button className="gap-2" onClick={handleFinish} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (<>Finish Setup <ArrowRight className="h-4 w-4" /></>)}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
