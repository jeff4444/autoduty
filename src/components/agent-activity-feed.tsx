"use client";

import { useEffect, useRef } from "react";
import {
  Brain,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search,
  Play,
  XCircle,
  Sparkles,
  Terminal,
  MessageSquare,
} from "lucide-react";
import type { SSEEvent } from "@/lib/api";

interface AgentActivityFeedProps {
  events: SSEEvent[];
  isStreaming: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  detected: "bg-destructive/20 text-destructive",
  investigating: "bg-warning/20 text-warning",
  fix_proposed: "bg-info/20 text-info",
  simulating: "bg-info/20 text-info",
  verified: "bg-success/20 text-success",
  failed: "bg-destructive/20 text-destructive",
  pr_created: "bg-accent/20 text-accent",
  resolved: "bg-success/20 text-success",
};

function formatTime(timestamp?: string): string {
  if (!timestamp) return "";
  try {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "";
  }
}

function EventItem({ event }: { event: SSEEvent }) {
  switch (event.type) {
    case "status_change": {
      const colorClass = STATUS_COLORS[event.status] || STATUS_COLORS.detected;
      return (
        <div className="flex items-center gap-2 py-2">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${colorClass}`}>
            {event.status.replace(/_/g, " ").toUpperCase()}
          </span>
          <span className="text-xs text-muted-foreground">{event.message}</span>
          <span className="text-[10px] text-muted-foreground/60 ml-auto">
            {formatTime(event.timestamp)}
          </span>
        </div>
      );
    }

    case "agent_thought": {
      const content = event.content || event.data?.content || "";
      return (
        <div className="flex gap-2 py-2">
          <Brain className="w-3.5 h-3.5 text-info mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap wrap-break-word">
              {content}
            </p>
          </div>
          <span className="text-[10px] text-muted-foreground/60 shrink-0">
            {formatTime(event.timestamp)}
          </span>
        </div>
      );
    }

    case "tool_call": {
      let args: Record<string, unknown> = {};
      const rawArgs = event.args;
      if (typeof rawArgs === "string") {
        try { args = JSON.parse(rawArgs); } catch { args = { raw: rawArgs }; }
      } else if (rawArgs && typeof rawArgs === "object") {
        args = rawArgs as Record<string, unknown>;
      }
      const argsStr = Object.entries(args)
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join(", ");
      return (
        <div className="flex gap-2 py-2">
          <Wrench className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <code className="text-xs font-mono text-foreground">
              {event.tool}
              <span className="text-muted-foreground">({argsStr})</span>
            </code>
          </div>
          <span className="text-[10px] text-muted-foreground/60 shrink-0">
            {formatTime(event.timestamp)}
          </span>
        </div>
      );
    }

    case "tool_result": {
      const result = typeof event.result === "string" ? event.result : JSON.stringify(event.result);
      return (
        <details className="py-1 ml-5">
          <summary className="text-[11px] text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-success" />
            {event.tool} returned {result.length > 80 ? `${result.length} chars` : ""}
          </summary>
          <pre className="mt-1 text-[11px] bg-muted/50 border border-border rounded-lg p-2 overflow-x-auto max-h-32 overflow-y-auto font-mono text-muted-foreground">
            {result}
          </pre>
        </details>
      );
    }

    case "model_request":
      return (
        <div className="flex items-center gap-2 py-1.5">
          <MessageSquare className="w-3 h-3 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">
            Calling model...
          </span>
          <span className="text-[10px] text-muted-foreground/60 ml-auto">
            {formatTime(event.timestamp)}
          </span>
        </div>
      );

    case "investigation_complete":
      return (
        <div className="border border-success/30 bg-success/5 rounded-lg p-3 my-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-success" />
            <span className="text-xs font-medium text-success">Investigation Complete</span>
          </div>
          <p className="text-xs text-foreground leading-relaxed">
            <span className="font-medium">Root cause:</span> {event.root_cause}
          </p>
          {event.fix_description && (
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-medium text-foreground">Fix:</span> {event.fix_description}
            </p>
          )}
          {event.num_file_edits > 0 && (
            <p className="text-[11px] text-muted-foreground mt-1">
              {event.num_file_edits} file{event.num_file_edits !== 1 ? "s" : ""} modified
            </p>
          )}
        </div>
      );

    case "agent_complete":
      return (
        <div className="flex items-center gap-2 py-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
          <span className="text-xs text-muted-foreground">{event.data?.message || "Agent finished"}</span>
        </div>
      );

    case "sandbox_phase":
      return (
        <div className="flex items-center gap-2 py-2">
          <Play className="w-3 h-3 text-info" />
          <span className="text-xs font-medium text-info">
            {event.phase === "reproduce" ? "Reproducing bug..." : "Verifying fix..."}
          </span>
          <span className="text-[10px] text-muted-foreground/60 ml-auto">
            {formatTime(event.timestamp)}
          </span>
        </div>
      );

    case "sandbox_status":
      return (
        <div className="flex items-center gap-2 py-1.5">
          <Terminal className="w-3 h-3 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">{event.message}</span>
        </div>
      );

    case "sandbox_output":
      return null; // Rendered separately in TerminalViewer

    case "sandbox_exit":
      return (
        <div className="flex items-center gap-2 py-1.5">
          <Terminal className="w-3 h-3 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">
            [{event.label}] exited with code{" "}
            <code className={`font-mono ${event.exit_code === 0 ? "text-success" : "text-destructive"}`}>
              {event.exit_code}
            </code>
          </span>
        </div>
      );

    case "sandbox_complete":
      return (
        <div className="flex items-center gap-3 py-2">
          <div className="flex items-center gap-1.5">
            {event.reproduced ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
            )}
            <span className="text-xs">Bug reproduced: {event.reproduced ? "Yes" : "No"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {event.fix_verified ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-destructive" />
            )}
            <span className="text-xs">Fix verified: {event.fix_verified ? "Yes" : "No"}</span>
          </div>
        </div>
      );

    case "error":
    case "sandbox_error":
      return (
        <div className="flex items-center gap-2 py-2 px-3 bg-destructive/10 border border-destructive/20 rounded-lg my-1">
          <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0" />
          <span className="text-xs text-destructive">{event.message}</span>
        </div>
      );

    case "done":
      return (
        <div className="flex items-center gap-2 py-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Stream complete</span>
        </div>
      );

    default:
      return null;
  }
}

export default function AgentActivityFeed({ events, isStreaming }: AgentActivityFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events.length]);

  // Filter out sandbox_output events (rendered in TerminalViewer)
  const visibleEvents = events.filter((e) => e.type !== "sandbox_output");

  if (visibleEvents.length === 0 && !isStreaming) {
    return null;
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <Search className="w-4 h-4 text-accent" />
        <span className="text-sm font-medium">Agent Activity</span>
        {isStreaming && (
          <span className="flex items-center gap-1.5 ml-auto">
            <span className="streaming-pulse w-2 h-2 rounded-full bg-success" />
            <span className="text-[11px] text-success">Live</span>
          </span>
        )}
      </div>
      <div className="px-4 py-2 max-h-[600px] overflow-y-auto divide-y divide-border/50">
        {visibleEvents.map((event, i) => (
          <EventItem key={i} event={event} />
        ))}
        {isStreaming && visibleEvents.length > 0 && (
          <div className="flex items-center gap-2 py-2">
            <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Thinking...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
