"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Shield,
  RefreshCw,
  AlertCircle,
  Search,
  CheckCircle2,
  Clock,
  GitPullRequest,
  Brain,
  Loader2,
  XCircle,
  Settings,
} from "lucide-react";
import { fetchIncidents, fetchSettings, updateSettings, type IncidentSummary } from "@/lib/api";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  detected: {
    label: "Detected",
    color: "bg-destructive/20 text-destructive",
    icon: <AlertCircle className="w-3 h-3" />,
  },
  investigating: {
    label: "Investigating",
    color: "bg-warning/20 text-warning",
    icon: <Search className="w-3 h-3" />,
  },
  fix_proposed: {
    label: "Fix Proposed",
    color: "bg-info/20 text-info",
    icon: <Brain className="w-3 h-3" />,
  },
  simulating: {
    label: "Simulating",
    color: "bg-info/20 text-info",
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
  },
  verified: {
    label: "Verified",
    color: "bg-success/20 text-success",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  failed: {
    label: "Failed",
    color: "bg-destructive/20 text-destructive",
    icon: <XCircle className="w-3 h-3" />,
  },
  pr_created: {
    label: "PR Created",
    color: "bg-accent/20 text-accent",
    icon: <GitPullRequest className="w-3 h-3" />,
  },
  resolved: {
    label: "Resolved",
    color: "bg-success/20 text-success",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
};

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState("gemini");
  const [showSettings, setShowSettings] = useState(false);

  const loadIncidents = async () => {
    try {
      const data = await fetchIncidents();
      setIncidents(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load incidents");
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const s = await fetchSettings();
      setProvider(s.llm_provider);
    } catch {
      // Backend might not be running yet
    }
  };

  const handleProviderChange = async (newProvider: string) => {
    setProvider(newProvider);
    try {
      await updateSettings({ llm_provider: newProvider });
    } catch (err) {
      console.error("Failed to update provider:", err);
    }
  };

  useEffect(() => {
    loadIncidents();
    loadSettings();
    const interval = setInterval(loadIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            <span className="text-lg font-bold tracking-tight">AutoDuty</span>
          </Link>
          <span className="text-muted-foreground text-sm ml-2">/ Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-muted-foreground hover:text-foreground transition p-2 rounded-lg hover:bg-muted"
          >
            <Settings className="w-4 h-4" />
          </button>
          <Link
            href="/demo"
            className="text-sm bg-accent hover:bg-accent/80 text-accent-foreground px-4 py-2 rounded-lg transition"
          >
            Trigger Demo
          </Link>
        </div>
      </nav>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-b border-border px-6 py-3 bg-card flex items-center gap-4">
          <span className="text-sm text-muted-foreground">LLM Provider:</span>
          {["gemini", "anthropic", "openai"].map((p) => (
            <button
              key={p}
              onClick={() => handleProviderChange(p)}
              className={`text-xs px-3 py-1.5 rounded-lg transition capitalize ${
                provider === p
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {p === "gemini" ? "Google Gemini" : p === "anthropic" ? "Anthropic Claude" : "OpenAI GPT"}
            </button>
          ))}
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Incidents</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {incidents.length} incident{incidents.length !== 1 ? "s" : ""} tracked
            </p>
          </div>
          <button
            onClick={() => { setLoading(true); loadIncidents(); }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border px-3 py-2 rounded-lg transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-lg p-4 mb-6 text-sm">
            {error}
          </div>
        )}

        {loading && incidents.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No incidents yet.</p>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 text-sm bg-accent hover:bg-accent/80 text-accent-foreground px-4 py-2 rounded-lg transition"
            >
              Trigger a Demo Error
            </Link>
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-card border-b border-border text-left">
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Error
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Root Cause
                  </th>
                  <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {incidents.map((inc) => {
                  const config = STATUS_CONFIG[inc.status] || STATUS_CONFIG.detected;
                  return (
                    <tr
                      key={inc.id}
                      className="hover:bg-card/50 transition cursor-pointer"
                    >
                      <td className="px-4 py-4">
                        <Link
                          href={`/dashboard/${inc.id}`}
                          className="font-mono text-sm text-accent hover:underline"
                        >
                          #{inc.id}
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
                        >
                          {config.icon}
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm">{inc.error_type}</td>
                      <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                        {inc.source_file}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground max-w-xs truncate">
                        {inc.root_cause || "—"}
                      </td>
                      <td className="px-4 py-4 text-xs text-muted-foreground">
                        {new Date(inc.created_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
