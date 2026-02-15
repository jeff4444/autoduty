"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  fetchIncident,
  subscribeToIncident,
  type IncidentDetail,
  type SSEEvent,
  type TerminalLogEntry,
  type FileEdit,
} from "@/lib/api";

/** Terminal states where the pipeline is finished and no SSE is needed. */
const TERMINAL_STATUSES = new Set(["pr_created", "resolved"]);

/** Statuses where polling makes more sense than SSE (already done). */
const DONE_STATUSES = new Set(["pr_created", "resolved", "failed", "verified", "fix_proposed"]);

export interface UseIncidentStreamReturn {
  /** The live-updating incident object. */
  incident: IncidentDetail | null;
  /** Ordered list of SSE events received (for the activity feed). */
  events: SSEEvent[];
  /** Live terminal output lines (for the terminal viewer). */
  terminalLines: TerminalLogEntry[];
  /** Whether the SSE stream is currently active. */
  isStreaming: boolean;
  /** Loading state for the initial fetch. */
  loading: boolean;
  /** Error message if the initial fetch or stream failed. */
  error: string | null;
}

export function useIncidentStream(incidentId: string): UseIncidentStreamReturn {
  const [incident, setIncident] = useState<IncidentDetail | null>(null);
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [terminalLines, setTerminalLines] = useState<TerminalLogEntry[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cleanupRef = useRef<(() => void) | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sseFailedRef = useRef(false);

  // -----------------------------------------------------------------------
  // SSE event handler
  // -----------------------------------------------------------------------
  const handleEvent = useCallback((event: SSEEvent) => {
    // Append every event to the activity log
    setEvents((prev) => [...prev, event]);

    switch (event.type) {
      case "status_change":
        setIncident((prev) =>
          prev ? { ...prev, status: event.status, updated_at: new Date().toISOString() } : prev,
        );
        break;

      case "investigation_complete":
        setIncident((prev) => {
          if (!prev) return prev;
          const fileEdits: FileEdit[] = (event.diffs || []).map((d) => ({
            file_path: d.file,
            original_content: "",
            new_content: "",
            unified_diff: d.unified_diff,
          }));
          return {
            ...prev,
            root_cause: event.root_cause,
            fix_description: event.fix_description,
            file_edits: fileEdits.length > 0 ? fileEdits : prev.file_edits,
          };
        });
        break;

      case "sandbox_output":
        setTerminalLines((prev) => [
          ...prev,
          {
            timestamp: event.timestamp || new Date().toISOString(),
            stream: event.stream,
            data: event.data,
            label: event.label,
          },
        ]);
        break;

      case "sandbox_complete":
        setIncident((prev) =>
          prev
            ? {
                ...prev,
                sandbox_reproduced: event.reproduced,
                sandbox_fix_verified: event.fix_verified,
              }
            : prev,
        );
        break;

      case "done":
        setIsStreaming(false);
        // Do a final fetch to get the fully-settled incident
        fetchIncident(incidentId)
          .then((data) => setIncident(data))
          .catch(() => {});
        break;
    }
  }, [incidentId]);

  // -----------------------------------------------------------------------
  // Initial fetch + SSE connection / fallback polling
  // -----------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const data = await fetchIncident(incidentId);
        if (cancelled) return;
        setIncident(data);
        setError(null);
        setLoading(false);

        // Populate terminal lines from existing data
        if (data.sandbox_terminal_log?.length > 0) {
          setTerminalLines(data.sandbox_terminal_log);
        }

        // Populate events from stored agent_events
        if (data.agent_events?.length > 0) {
          const restored: SSEEvent[] = data.agent_events.map((ae) => {
            const flat: Record<string, unknown> = {
              type: ae.type,
              timestamp: ae.timestamp,
              ...ae.data,
            };
            // Ensure tool_call args are parsed if stored as string
            if (ae.type === "tool_call" && typeof ae.data.args === "string") {
              try {
                flat.args = JSON.parse(ae.data.args as string);
              } catch {
                flat.args = { raw: ae.data.args };
              }
            }
            return flat as unknown as SSEEvent;
          });
          setEvents(restored);
        }

        // If the incident is in a terminal/done state, skip SSE
        if (TERMINAL_STATUSES.has(data.status)) {
          return;
        }

        // If status suggests pipeline may still be running, try SSE
        if (!DONE_STATUSES.has(data.status)) {
          startSSE();
        } else {
          // Pipeline is done but we can still connect briefly to catch final events
          // or just poll
          startPolling();
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load incident");
        setLoading(false);
        startPolling();
      }
    };

    const startSSE = () => {
      setIsStreaming(true);
      const cleanup = subscribeToIncident(
        incidentId,
        handleEvent,
        () => {
          // On SSE error — fall back to polling
          sseFailedRef.current = true;
          setIsStreaming(false);
          cleanup();
          cleanupRef.current = null;
          startPolling();
        },
      );
      cleanupRef.current = cleanup;
    };

    const startPolling = () => {
      if (pollingRef.current) return;
      pollingRef.current = setInterval(async () => {
        try {
          const data = await fetchIncident(incidentId);
          if (!cancelled) setIncident(data);
        } catch {
          // Ignore polling errors
        }
      }, 5000);
    };

    init();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
      cleanupRef.current = null;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [incidentId, handleEvent]);

  return { incident, events, terminalLines, isStreaming, loading, error };
}
