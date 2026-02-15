"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  ArrowLeft,
  Activity,
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
  ExternalLink,
  Store,
} from "lucide-react";
import { fetchIncidents, fetchSettings, updateSettings, type IncidentSummary } from "@/lib/api";
import { motion } from "framer-motion";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  detected: {
    label: "Detected",
    color: "bg-destructive/15 text-destructive",
    icon: <AlertCircle className="w-3 h-3" />,
  },
  investigating: {
    label: "Investigating",
    color: "bg-info/15 text-info",
    icon: <Search className="w-3 h-3" />,
  },
  fix_proposed: {
    label: "Fix Proposed",
    color: "bg-warning/15 text-warning",
    icon: <Brain className="w-3 h-3" />,
  },
  simulating: {
    label: "Simulating",
    color: "bg-nova/15 text-nova",
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
  },
  verified: {
    label: "Verified",
    color: "bg-success/15 text-success",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  failed: {
    label: "Failed",
    color: "bg-destructive/15 text-destructive",
    icon: <XCircle className="w-3 h-3" />,
  },
  pr_created: {
    label: "PR Created",
    color: "bg-nova/15 text-nova",
    icon: <GitPullRequest className="w-3 h-3" />,
  },
  resolved: {
    label: "Resolved",
    color: "bg-success/15 text-success",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

export default function AdminDashboardPage() {
  const [incidents, setIncidents] = useState<IncidentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiModel, setAiModel] = useState("anthropic:claude-sonnet-4-20250514");
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();

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
      setAiModel(s.ai_model);
    } catch {
      // Backend might not be running yet
    }
  };

  const handleModelChange = async (newModel: string) => {
    setAiModel(newModel);
    try {
      await updateSettings({ ai_model: newModel });
    } catch (err) {
      console.error("Failed to update model:", err);
    }
  };

  useEffect(() => {
    loadIncidents();
    loadSettings();
    const interval = setInterval(loadIncidents, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Admin Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-info" />
              <span className="font-heading text-lg font-bold tracking-tight">AutoDuty</span>
            </div>
            <nav className="hidden sm:flex items-center gap-4 ml-6">
              <Link
                href="/admin/dashboard"
                className="text-sm font-medium text-foreground"
              >
                <span className="flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5" />
                  Incidents
                </span>
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition flex items-center gap-1.5"
            >
              <Store className="w-4 h-4" />
              View Store
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6 text-info" /> Incidents
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitoring NovaBuy store for errors &bull; Polling every 5s
              {incidents.length > 0 && ` \u2022 ${incidents.length} incident${incidents.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Settings className="h-4 w-4" /> Settings
            </button>
            <button
              onClick={() => { setLoading(true); loadIncidents(); }}
              className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </div>

        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 rounded-lg border border-border p-4"
          >
            <h3 className="font-semibold mb-3">AI Model</h3>
            <div className="flex gap-2 flex-wrap">
              {[
                { model: "anthropic:claude-sonnet-4-20250514", label: "Claude Sonnet" },
                { model: "google-gla:gemini-2.0-flash", label: "Gemini Flash" },
                { model: "openai:gpt-4o", label: "GPT-4o" },
              ].map(({ model, label }) => (
                <button
                  key={model}
                  onClick={() => handleModelChange(model)}
                  className={`inline-flex items-center justify-center h-9 px-3 rounded-md text-sm font-medium transition-colors ${
                    aiModel === model
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

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
            <p className="text-xs text-muted-foreground">
              Incidents will appear here automatically when errors are detected in the store.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">ID</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Error</th>

                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Root Cause</th>
                    <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Time</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((inc, i) => {
                    const config = STATUS_CONFIG[inc.status] || STATUS_CONFIG.detected;
                    return (
                      <motion.tr
                        key={inc.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => router.push(`/admin/dashboard/${inc.id}`)}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 font-mono text-sm font-medium">#{inc.id}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.color}`}>
                            {config.icon}
                            {config.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm text-destructive">{inc.error_type}</td>

                        <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell max-w-xs truncate">{inc.root_cause || "\u2014"}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatTime(inc.created_at)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
