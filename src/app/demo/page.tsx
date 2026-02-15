"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Zap,
  Users,
  ShoppingCart,
  Heart,
  ArrowRight,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { fetchIncidents, type IncidentSummary } from "@/lib/api";

interface LogEntry {
  timestamp: string;
  message: string;
  type: "info" | "error" | "success" | "warning";
}

export default function DemoPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [triggering, setTriggering] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: LogEntry["type"] = "info") => {
    setLogs((prev) => [
      ...prev,
      { timestamp: new Date().toLocaleTimeString(), message, type },
    ]);
  };

  // Poll for incident updates
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const data = await fetchIncidents();
        setIncidents(data);
      } catch {
        // Backend might not be running
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const triggerError = async (endpoint: string, name: string) => {
    setTriggering(endpoint);
    addLog(`Triggering ${name}...`, "warning");

    try {
      const res = await fetch(endpoint);
      const body = await res.text();

      if (res.status >= 500) {
        addLog(`${name} returned ${res.status} — Error detected!`, "error");
        addLog(`Response: ${body.substring(0, 200)}`, "error");
        addLog(`Error automatically reported to AutoDuty backend`, "info");
        addLog(`Check the dashboard for the new incident`, "success");
      } else {
        addLog(`${name} returned ${res.status} — No error`, "success");
      }
    } catch (err) {
      addLog(`Failed to reach ${endpoint}: ${err}`, "error");
    } finally {
      setTriggering(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            <span className="text-lg font-bold tracking-tight">AutoDuty</span>
          </Link>
          <span className="text-muted-foreground text-sm ml-2">/ Demo</span>
        </div>
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground transition flex items-center gap-1"
        >
          Open Dashboard <ArrowRight className="w-3 h-3" />
        </Link>
      </nav>

      <main className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Live Demo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Trigger real errors in the application and watch AutoDuty diagnose, fix, and
            create PRs in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trigger Panel */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Error Triggers
            </h2>

            <TriggerCard
              icon={<Users className="w-5 h-5 text-info" />}
              title="/api/users — TypeError"
              description='Accesses .data.users on an object shaped { users: [...] }. The missing .data level causes "Cannot read properties of undefined".'
              onClick={() => triggerError("/api/users", "/api/users")}
              loading={triggering === "/api/users"}
            />

            <TriggerCard
              icon={<ShoppingCart className="w-5 h-5 text-warning" />}
              title="/api/orders — Null Reference"
              description="Calls .toLowerCase() on an order status that is undefined for some records. Classic null reference bug."
              onClick={() => triggerError("/api/orders", "/api/orders")}
              loading={triggering === "/api/orders"}
            />

            <TriggerCard
              icon={<Heart className="w-5 h-5 text-success" />}
              title="/api/health — Control (Healthy)"
              description="A clean endpoint that always returns 200. Use this to confirm not everything is broken."
              onClick={() => triggerError("/api/health", "/api/health")}
              loading={triggering === "/api/health"}
              variant="success"
            />
          </div>

          {/* Log Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Live Log
              </h2>
              {logs.length > 0 && (
                <button
                  onClick={() => setLogs([])}
                  className="text-xs text-muted-foreground hover:text-foreground transition"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="border border-border rounded-xl bg-card h-80 overflow-y-auto p-4 font-mono text-xs space-y-1">
              {logs.length === 0 ? (
                <p className="text-muted-foreground">
                  Click a trigger to see live logs...
                </p>
              ) : (
                logs.map((entry, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-muted-foreground shrink-0">
                      [{entry.timestamp}]
                    </span>
                    <span
                      className={
                        entry.type === "error"
                          ? "text-destructive"
                          : entry.type === "success"
                          ? "text-success"
                          : entry.type === "warning"
                          ? "text-warning"
                          : "text-muted-foreground"
                      }
                    >
                      {entry.message}
                    </span>
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>

            {/* Recent Incidents Mini-list */}
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Recent Incidents
              </h2>
              {incidents.length === 0 ? (
                <p className="text-xs text-muted-foreground border border-border rounded-lg p-4">
                  No incidents yet. Trigger an error above to get started.
                </p>
              ) : (
                <div className="border border-border rounded-xl divide-y divide-border">
                  {incidents.slice(0, 5).map((inc) => (
                    <Link
                      key={inc.id}
                      href={`/dashboard/${inc.id}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-card/50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <IncidentStatusIcon status={inc.status} />
                        <div>
                          <p className="text-sm font-mono">#{inc.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {inc.source_file}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground capitalize">
                        {inc.status.replace("_", " ")}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function TriggerCard({
  icon,
  title,
  description,
  onClick,
  loading,
  variant = "default",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  loading: boolean;
  variant?: "default" | "success";
}) {
  return (
    <div className="border border-border rounded-xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      <button
        onClick={onClick}
        disabled={loading}
        className={`flex items-center gap-2 text-xs px-4 py-2 rounded-lg font-medium transition ${
          variant === "success"
            ? "bg-success/20 text-success hover:bg-success/30"
            : "bg-destructive/20 text-destructive hover:bg-destructive/30"
        } disabled:opacity-50`}
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <Zap className="w-3 h-3" />
        )}
        {loading ? "Triggering..." : "Trigger Error"}
      </button>
    </div>
  );
}

function IncidentStatusIcon({ status }: { status: string }) {
  switch (status) {
    case "detected":
      return <AlertCircle className="w-4 h-4 text-destructive" />;
    case "investigating":
    case "simulating":
      return <Loader2 className="w-4 h-4 text-warning animate-spin" />;
    case "fix_proposed":
      return <Zap className="w-4 h-4 text-info" />;
    case "verified":
      return <CheckCircle2 className="w-4 h-4 text-success" />;
    case "pr_created":
      return <CheckCircle2 className="w-4 h-4 text-accent" />;
    case "failed":
      return <XCircle className="w-4 h-4 text-destructive" />;
    default:
      return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
  }
}
