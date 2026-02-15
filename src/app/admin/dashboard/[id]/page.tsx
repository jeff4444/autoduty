"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  Activity,
  CheckCircle2,
  XCircle,
  GitPullRequest,
  ExternalLink,
  Loader2,
  AlertCircle,
  Brain,
  Terminal,
  Store,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { approveIncident, type IncidentDetail } from "@/lib/api";
import { useIncidentStream } from "@/hooks/use-incident-stream";
import AgentActivityFeed from "@/components/agent-activity-feed";
import DiffViewer from "@/components/diff-viewer";
import TerminalViewer from "@/components/terminal-viewer";

export default function AdminIncidentDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { incident, events, terminalLines, isStreaming, loading, error } =
    useIncidentStream(id);

  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true,
    sandbox: true,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApprove = async () => {
    if (!incident) return;
    setApproving(true);
    setApproveError(null);
    try {
      const result = await approveIncident(id);
      incident.status = "pr_created";
      incident.pr_url = result.pr_url;
    } catch (err) {
      setApproveError(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setApproving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <AdminHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <p className="text-muted-foreground">{error || "Incident not found."}</p>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center justify-center gap-2 h-10 px-4 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    detected: { label: "Detected", color: "bg-destructive/15 text-destructive" },
    investigating: { label: "Investigating", color: "bg-info/15 text-info" },
    fix_proposed: { label: "Fix Proposed", color: "bg-warning/15 text-warning" },
    simulating: { label: "Simulating", color: "bg-nova/15 text-nova" },
    verified: { label: "Verified", color: "bg-success/15 text-success" },
    failed: { label: "Failed", color: "bg-destructive/15 text-destructive" },
    pr_created: { label: "PR Created", color: "bg-nova/15 text-nova" },
    resolved: { label: "Resolved", color: "bg-success/15 text-success" },
  };

  const status = statusConfig[incident.status] || statusConfig.detected;
  const hasFileEdits = incident.file_edits && incident.file_edits.length > 0;
  const hasLegacyCode = incident.original_code || incident.fixed_code;
  const isVerifiedOrResolved = ["verified", "fix_proposed", "pr_created", "resolved"].includes(incident.status);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AdminHeader incidentId={incident.id} />

      <main className="flex-1 container py-6">
        {/* Back link */}
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center justify-center gap-2 mb-4 h-9 px-3 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> All Incidents
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono">#{incident.id}</h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.color}`}>
                {status.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1 font-mono">
              {incident.error_type} in {incident.source_file}
            </p>
          </div>
          <div className="flex gap-2">
            {incident.pr_url ? (
              <a
                href={incident.pr_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <GitPullRequest className="h-4 w-4" /> View PR
              </a>
            ) : (
              <button
                onClick={handleApprove}
                disabled={approving || !isVerifiedOrResolved}
                className="inline-flex items-center justify-center gap-2 h-9 px-3 rounded-md text-sm font-semibold bg-nova text-nova-foreground hover:bg-nova/90 shadow-lg shadow-nova/25 transition-colors disabled:pointer-events-none disabled:opacity-50"
              >
                {approving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <GitPullRequest className="h-4 w-4" />
                )}
                {approving ? "Creating PR..." : "Approve Fix & Create PR"}
              </button>
            )}
          </div>
        </div>

        {approveError && (
          <p className="text-sm text-destructive mb-4">{approveError}</p>
        )}

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="rounded-lg border border-border p-4">
            <button onClick={() => toggleSection("summary")} className="flex items-center justify-between w-full">
              <h3 className="font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4 text-info" /> Root Cause
              </h3>
              {expandedSections.summary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {expandedSections.summary && (
              <div className="mt-3">
                <p className="text-sm text-muted-foreground">
                  {incident.root_cause || "Still investigating..."}
                </p>
                {incident.fix_description && (
                  <div className="pt-2 border-t border-border mt-2">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Fix:</span> {incident.fix_description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="rounded-lg border border-border p-4">
            <button onClick={() => toggleSection("sandbox")} className="flex items-center justify-between w-full">
              <h3 className="font-semibold flex items-center gap-2">
                <Terminal className="h-4 w-4 text-success" /> Sandbox Verification
              </h3>
              {expandedSections.sandbox ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {expandedSections.sandbox && (
              <div className="mt-3 space-y-2">
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
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      {incident.sandbox_reproduced ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span>Bug reproduced in sandbox</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {incident.sandbox_fix_verified ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-destructive" />
                      )}
                      <span>Fix verified — {incident.sandbox_fix_verified ? "all tests passing" : "tests failing"}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <AgentActivityFeed events={events} isStreaming={isStreaming} />

        {/* Code Diffs */}
        {hasFileEdits && (
          <div className="mt-6">
            <DiffViewer fileEdits={incident.file_edits} />
          </div>
        )}

        {/* Legacy code display */}
        {!hasFileEdits && hasLegacyCode && (
          <div className="mt-6 grid grid-cols-1 gap-4">
            {incident.original_code && (
              <div className="border border-border rounded-lg p-5 space-y-3">
                <h2 className="text-sm font-medium text-destructive">Original (Buggy)</h2>
                <pre className="text-xs bg-destructive/5 border border-destructive/20 rounded-lg p-4 overflow-x-auto max-h-96 overflow-y-auto font-mono">
                  {incident.original_code}
                </pre>
              </div>
            )}
            {incident.fixed_code && (
              <div className="border border-border rounded-lg p-5 space-y-3">
                <h2 className="text-sm font-medium text-success">Fixed</h2>
                <pre className="text-xs bg-success/5 border border-success/20 rounded-lg p-4 overflow-x-auto max-h-96 overflow-y-auto font-mono">
                  {incident.fixed_code}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Error Traceback */}
        <div className="mt-6 rounded-lg border border-border p-5 space-y-3">
          <h2 className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            Error Traceback
          </h2>
          <div className="rounded-lg bg-terminal-bg p-4 font-mono text-sm text-destructive whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto">
            {incident.traceback}
          </div>
        </div>

        {/* Sandbox Terminal Output */}
        <div className="mt-6">
          <TerminalViewer
            lines={terminalLines}
            streaming={isStreaming && ["simulating"].includes(incident.status)}
            legacyOutput={terminalLines.length === 0 ? incident.sandbox_output : null}
          />
        </div>

        {/* Logs */}
        {incident.logs.length > 0 && (
          <div className="mt-6 rounded-lg border border-border p-5">
            <details>
              <summary className="text-sm font-medium cursor-pointer hover:text-muted-foreground">
                Recent Logs ({incident.logs.length} lines)
              </summary>
              <div className="mt-3 rounded-lg bg-terminal-bg p-4 font-mono text-xs space-y-1 overflow-x-auto max-h-48 overflow-y-auto">
                {incident.logs.map((log: string, i: number) => (
                  <div
                    key={i}
                    className={
                      log.includes("500") || log.includes("Error")
                        ? "text-destructive"
                        : log.includes("200")
                        ? "text-terminal-fg"
                        : "text-muted-foreground"
                    }
                  >
                    {log}
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Admin Header
// ---------------------------------------------------------------------------
function AdminHeader({ incidentId }: { incidentId?: string }) {
  return (
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
            {incidentId && (
              <span className="text-sm text-muted-foreground">/ #{incidentId}</span>
            )}
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
  );
}
