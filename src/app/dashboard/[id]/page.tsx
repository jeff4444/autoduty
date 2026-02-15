"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  GitPullRequest,
  ExternalLink,
  Loader2,
  AlertCircle,
  Brain,
  Terminal,
} from "lucide-react";
import { fetchIncident, approveIncident, type IncidentDetail } from "@/lib/api";

export default function IncidentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);

  const load = async () => {
    try {
      const data = await fetchIncident(id);
      setIncident(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load incident");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setApproving(true);
    setApproveError(null);
    try {
      const result = await approveIncident(id);
      setIncident((prev) =>
        prev ? { ...prev, status: "pr_created", pr_url: result.pr_url } : prev
      );
    } catch (err) {
      setApproveError(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setApproving(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <p className="text-destructive">{error || "Incident not found"}</p>
          <Link href="/dashboard" className="text-sm text-accent hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            <span className="text-lg font-bold tracking-tight">AutoDuty</span>
          </Link>
          <span className="text-muted-foreground text-sm ml-2">
            / <Link href="/dashboard" className="hover:text-foreground transition">Dashboard</Link> / #{incident.id}
          </span>
        </div>
      </nav>

      <main className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full space-y-6">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to incidents
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">Incident #{incident.id}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {incident.source_file} — Error {incident.error_type}
            </p>
          </div>
          <StatusBadge status={incident.status} />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Root Cause */}
          <div className="border border-border rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Brain className="w-4 h-4 text-info" />
              Root Cause
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {incident.root_cause || "Still investigating..."}
            </p>
            {incident.fix_description && (
              <div className="pt-2 border-t border-border mt-2">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Fix:</span>{" "}
                  {incident.fix_description}
                </p>
              </div>
            )}
          </div>

          {/* Sandbox Results */}
          <div className="border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Terminal className="w-4 h-4 text-success" />
              Sandbox Verification
            </div>
            {incident.sandbox_reproduced === null ? (
              <p className="text-sm text-muted-foreground">
                {incident.status === "simulating" ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Running sandbox...
                  </span>
                ) : (
                  "Pending..."
                )}
              </p>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {incident.sandbox_reproduced ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                  Bug Reproduced:{" "}
                  <span className={incident.sandbox_reproduced ? "text-success" : "text-muted-foreground"}>
                    {incident.sandbox_reproduced ? "YES" : "NO"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {incident.sandbox_fix_verified ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <XCircle className="w-4 h-4 text-destructive" />
                  )}
                  Fix Verified:{" "}
                  <span className={incident.sandbox_fix_verified ? "text-success" : "text-destructive"}>
                    {incident.sandbox_fix_verified ? "PASS" : "FAIL"}
                  </span>
                </div>
              </div>
            )}
            {incident.sandbox_output && (
              <details className="pt-2">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  View sandbox output
                </summary>
                <pre className="mt-2 text-xs bg-background border border-border rounded-lg p-3 overflow-x-auto max-h-48 overflow-y-auto font-mono">
                  {incident.sandbox_output}
                </pre>
              </details>
            )}
          </div>
        </div>

        {/* Error Traceback */}
        <div className="border border-border rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            Error Traceback
          </h2>
          <pre className="text-xs bg-background border border-border rounded-lg p-4 overflow-x-auto max-h-64 overflow-y-auto font-mono text-destructive/80">
            {incident.traceback}
          </pre>
        </div>

        {/* Code Diff */}
        {(incident.original_code || incident.fixed_code) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incident.original_code && (
              <div className="border border-border rounded-xl p-5 space-y-3">
                <h2 className="text-sm font-medium text-destructive">
                  Original (Buggy)
                </h2>
                <pre className="text-xs bg-destructive/5 border border-destructive/20 rounded-lg p-4 overflow-x-auto max-h-96 overflow-y-auto font-mono">
                  {incident.original_code}
                </pre>
              </div>
            )}
            {incident.fixed_code && (
              <div className="border border-border rounded-xl p-5 space-y-3">
                <h2 className="text-sm font-medium text-success">Fixed</h2>
                <pre className="text-xs bg-success/5 border border-success/20 rounded-lg p-4 overflow-x-auto max-h-96 overflow-y-auto font-mono">
                  {incident.fixed_code}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="border border-border rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-medium">Actions</h2>

          {incident.pr_url ? (
            <div className="flex items-center gap-3">
              <GitPullRequest className="w-5 h-5 text-accent" />
              <div>
                <p className="text-sm font-medium">Pull Request Created</p>
                <a
                  href={incident.pr_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent hover:underline flex items-center gap-1"
                >
                  {incident.pr_url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleApprove}
                disabled={
                  approving ||
                  !["verified", "fix_proposed"].includes(incident.status)
                }
                className="flex items-center gap-2 bg-accent hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed text-accent-foreground px-5 py-2.5 rounded-lg text-sm font-medium transition"
              >
                {approving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <GitPullRequest className="w-4 h-4" />
                )}
                {approving ? "Creating PR..." : "Approve Fix & Create PR"}
              </button>
              {!["verified", "fix_proposed"].includes(incident.status) && (
                <p className="text-xs text-muted-foreground">
                  Fix must be proposed or verified before creating a PR.
                </p>
              )}
              {approveError && (
                <p className="text-sm text-destructive">{approveError}</p>
              )}
            </div>
          )}
        </div>

        {/* Logs */}
        {incident.logs.length > 0 && (
          <details className="border border-border rounded-xl p-5">
            <summary className="text-sm font-medium cursor-pointer hover:text-muted-foreground">
              Recent Logs ({incident.logs.length} lines)
            </summary>
            <pre className="mt-3 text-xs bg-background border border-border rounded-lg p-4 overflow-x-auto max-h-48 overflow-y-auto font-mono text-muted-foreground">
              {incident.logs.join("\n")}
            </pre>
          </details>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; color: string }> = {
    detected: { label: "Detected", color: "bg-destructive/20 text-destructive" },
    investigating: { label: "Investigating", color: "bg-warning/20 text-warning" },
    fix_proposed: { label: "Fix Proposed", color: "bg-info/20 text-info" },
    simulating: { label: "Simulating", color: "bg-info/20 text-info" },
    verified: { label: "Verified", color: "bg-success/20 text-success" },
    failed: { label: "Failed", color: "bg-destructive/20 text-destructive" },
    pr_created: { label: "PR Created", color: "bg-accent/20 text-accent" },
    resolved: { label: "Resolved", color: "bg-success/20 text-success" },
  };
  const cfg = configs[status] || configs.detected;
  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}
