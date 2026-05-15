"use client";

import { Mic } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
      {/* Gradient Mesh Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[40%] -top-[40%] h-[80%] w-[80%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-[30%] -right-[30%] h-[70%] w-[70%] rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute left-[50%] top-[50%] h-[50%] w-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      {/* Grid Pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Mic className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">MeetAI</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-Powered Meeting Companion
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
