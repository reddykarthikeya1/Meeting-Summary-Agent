"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { API_URL } from "@/lib/constants";

const socialProviders = [
  { name: "Google", icon: "G", color: "bg-red-500/10 text-red-500" },
  { name: "GitHub", icon: "GH", color: "bg-zinc-500/10 text-zinc-500" },
  { name: "Microsoft", icon: "M", color: "bg-blue-500/10 text-blue-500" },
];

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
  if (score === 2) return { score, label: "Fair", color: "bg-amber-500" };
  if (score === 3) return { score, label: "Good", color: "bg-blue-500" };
  return { score, label: "Strong", color: "bg-emerald-500" };
}

const passwordRequirements = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Upper and lowercase letters", test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { label: "At least one number", test: (p: string) => /\d/.test(p) },
  { label: "At least one special character", test: (p: string) => /[^a-zA-Z0-9]/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Registration failed" }));
        throw new Error(err.detail || "Registration failed");
      }

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success(`Welcome, ${data.user.name}!`);
      router.push("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="border-border/50 bg-card/80 backdrop-blur-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>Start your AI-powered meeting journey</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {socialProviders.map((provider) => (
                <Button key={provider.name} type="button" variant="outline" className="h-11 gap-2">
                  <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${provider.color}`}>
                    {provider.icon}
                  </span>
                  <span className="hidden text-xs sm:inline">{provider.name}</span>
                </Button>
              ))}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  placeholder="Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
                {password.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strength.score ? strength.color : "bg-muted"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password strength: <span className="font-medium">{strength.label}</span>
                    </p>
                  </div>
                )}
                {password.length > 0 && (
                  <div className="space-y-1">
                    {passwordRequirements.map((req) => (
                      <div key={req.label} className="flex items-center gap-2">
                        <Check className={`h-3 w-3 ${req.test(password) ? "text-emerald-500" : "text-muted-foreground/30"}`} />
                        <span className={`text-[11px] ${req.test(password) ? "text-emerald-500" : "text-muted-foreground"}`}>{req.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Confirm Password</label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-red-500">Passwords do not match.</p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (<>Create Account <ArrowRight className="h-4 w-4" /></>)}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
