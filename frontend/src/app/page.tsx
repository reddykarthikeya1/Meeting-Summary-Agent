"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Mic,
  Sparkles,
  FileText,
  ListChecks,
  Search,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/shared/glass-card";
import { StaggerContainer, StaggerItem } from "@/components/shared/stagger-children";

const features = [
  {
    icon: Mic,
    title: "Live Recording",
    description: "Record meetings with real-time waveform visualization and speaker detection.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Sparkles,
    title: "AI Transcription",
    description: "Multi-provider AI transcription with speaker identification and timestamps.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    icon: FileText,
    title: "Smart Summaries",
    description: "Automatic brief and detailed summaries powered by your choice of AI provider.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: ListChecks,
    title: "Action Items",
    description: "AI-extracted action items with priorities, assignees, and due dates.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Search,
    title: "Full-Text Search",
    description: "Search across all meetings, transcripts, and action items instantly.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Shield,
    title: "Multi-Provider AI",
    description: "Choose from OpenAI, Anthropic, Gemini, or Mistral for each meeting.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
];

const steps = [
  {
    step: "01",
    title: "Record or Upload",
    description: "Start a live recording or upload an existing audio file. MeetAI supports all major audio formats.",
  },
  {
    step: "02",
    title: "AI Processing",
    description: "Our AI transcribes, identifies speakers, and generates summaries and action items automatically.",
  },
  {
    step: "03",
    title: "Review & Share",
    description: "Review transcripts, edit action items, add comments, and share with your team.",
  },
];

const testimonials = [
  { name: "Sarah Chen", role: "Engineering Lead", quote: "MeetAI cut our meeting follow-up time by 80%. The AI summaries are incredibly accurate." },
  { name: "David Lee", role: "Product Manager", quote: "The action item extraction is a game-changer. We never lose track of commitments anymore." },
  { name: "Emily Brown", role: "Design Director", quote: "Beautiful interface, powerful features. It's the meeting tool we didn't know we needed." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Mic className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">MeetAI</span>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Testimonials
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="gap-1.5">
                Get Started
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-32">
        {/* Gradient Mesh */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-[30%] -top-[30%] h-[70%] w-[70%] rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute -bottom-[20%] -right-[20%] h-[60%] w-[60%] rounded-full bg-violet-500/8 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Badge variant="secondary" className="mb-6 gap-1.5">
              <Zap className="h-3 w-3" />
              AI-Powered Meeting Intelligence
            </Badge>

            <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Your AI-Powered{" "}
              <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                Meeting Companion
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Record, transcribe, summarize, and extract action items from your meetings.
              Choose from multiple AI providers. Never miss an important detail again.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2 px-8 shadow-lg shadow-primary/25">
                  Start for Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="gap-2 px-8">
                  <Mic className="h-4 w-4" />
                  Watch Demo
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Free 14-day trial
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                No credit card required
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Cancel anytime
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need for smarter meetings
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              From recording to action items, MeetAI handles the entire meeting lifecycle with AI.
            </p>
          </motion.div>

          <StaggerContainer className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <StaggerItem key={feature.title}>
                  <GlassCard className="group p-6 transition-all hover:-translate-y-1">
                    <div className={`mb-4 inline-flex rounded-xl ${feature.bg} p-3`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </GlassCard>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="border-y border-border bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-4">How it Works</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Three simple steps to better meetings
            </h2>
          </motion.div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-8 hidden h-0.5 w-8 translate-x-4 bg-border md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="secondary" className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Loved by teams everywhere
            </h2>
          </motion.div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <GlassCard className="p-6">
                  <div className="mb-4 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border py-24">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to transform your meetings?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Join thousands of teams who use MeetAI to make their meetings more productive.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2 px-8 shadow-lg shadow-primary/25">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Mic className="h-4 w-4" />
                </div>
                <span className="font-bold">MeetAI</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                AI-powered meeting intelligence for modern teams.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
            &copy; 2026 MeetAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
