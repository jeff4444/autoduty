"use client";

import Link from "next/link";
import {
  Shield,
  Zap,
  GitPullRequest,
  Brain,
  ArrowRight,
  Terminal,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-accent" />
          <span className="text-lg font-bold tracking-tight">AutoDuty</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Dashboard
          </Link>
          <Link
            href="/demo"
            className="text-sm bg-accent hover:bg-accent/80 text-accent-foreground px-4 py-2 rounded-lg transition"
          >
            Live Demo
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="max-w-3xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground mb-4">
            <Zap className="w-3 h-3 text-warning" />
            Autonomous Incident Remediation
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
            Your AI SRE that fixes incidents{" "}
            <span className="text-accent">before you wake up.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            PagerDuty wakes you up when things break. AutoDuty wakes up, diagnoses the
            root cause, verifies a fix in a sandbox, and opens a PR — only pinging you
            if it fails.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/demo"
              className="flex items-center gap-2 bg-accent hover:bg-accent/80 text-accent-foreground px-6 py-3 rounded-lg text-sm font-medium transition"
            >
              Trigger a Demo
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 border border-border hover:border-muted-foreground px-6 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition"
            >
              Open Dashboard
            </Link>
          </div>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-24 max-w-4xl w-full">
          <FeatureCard
            icon={<Brain className="w-5 h-5 text-info" />}
            title="AI Diagnosis"
            description="Gemini, Claude, or GPT analyzes your error traceback and source code to pinpoint the exact root cause."
          />
          <FeatureCard
            icon={<Terminal className="w-5 h-5 text-success" />}
            title="Sandbox Verification"
            description="Every fix is tested in an isolated Modal sandbox before anyone touches production."
          />
          <FeatureCard
            icon={<GitPullRequest className="w-5 h-5 text-accent" />}
            title="Auto PR"
            description="Verified fixes become GitHub PRs with full context — root cause, diff, and sandbox results."
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        AutoDuty — Built for the hackathon. Not your average alerting tool.
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="border border-border rounded-xl p-6 space-y-3 hover:border-muted-foreground/50 transition">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
