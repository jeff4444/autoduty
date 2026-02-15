/**
 * API client for communicating with the AutoDuty backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_AUTODUTY_API || "http://localhost:5001";

// ---------------------------------------------------------------------------
// Sub-model types (match backend Pydantic models)
// ---------------------------------------------------------------------------
export interface FileEdit {
  file_path: string;
  original_content: string;
  new_content: string;
  unified_diff: string;
}

export interface TerminalLogEntry {
  timestamp: string;
  stream: "stdout" | "stderr";
  data: string;
  label: string;
}

export interface AgentEvent {
  timestamp: string;
  type: string;
  data: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// SSE event types streamed from GET /incidents/{id}/stream
// ---------------------------------------------------------------------------
export type SSEEvent =
  | { type: "status_change"; status: string; message: string; timestamp?: string }
  | { type: "model_request"; timestamp: string; data: { message: string } }
  | { type: "agent_thought"; timestamp: string; content?: string; data?: { content: string } }
  | { type: "tool_call"; tool: string; args: Record<string, unknown>; tool_call_id?: string; timestamp?: string }
  | { type: "tool_result"; tool: string; result: string; timestamp?: string }
  | { type: "investigation_complete"; root_cause: string; fix_description: string; affected_files: string[]; num_file_edits: number; diffs: { file: string; unified_diff: string }[]; timestamp?: string }
  | { type: "agent_complete"; timestamp: string; data: { message: string } }
  | { type: "error"; message: string; timestamp?: string }
  | { type: "sandbox_status"; label: string; message: string; timestamp?: string }
  | { type: "sandbox_phase"; phase: string; message: string; timestamp?: string }
  | { type: "sandbox_output"; label: string; stream: "stdout" | "stderr"; data: string; timestamp?: string }
  | { type: "sandbox_exit"; label: string; exit_code: number; timestamp?: string }
  | { type: "sandbox_complete"; reproduced: boolean; fix_verified: boolean; timestamp?: string }
  | { type: "sandbox_error"; message: string; timestamp?: string }
  | { type: "done"; status: string; timestamp?: string };

// ---------------------------------------------------------------------------
// Incident models
// ---------------------------------------------------------------------------
export interface IncidentSummary {
  id: string;
  error_type: string;
  source_file: string;
  status: string;
  created_at: string;
  updated_at: string;
  root_cause: string | null;
}

export interface IncidentDetail extends IncidentSummary {
  traceback: string;
  logs: string[];
  repo_url: string;
  branch: string;
  fix_description: string | null;
  original_code: string | null;
  fixed_code: string | null;
  affected_file: string | null;
  sandbox_reproduced: boolean | null;
  sandbox_fix_verified: boolean | null;
  sandbox_output: string | null;
  pr_url: string | null;
  pr_branch: string | null;
  // New fields from the overhauled backend
  file_edits: FileEdit[];
  sandbox_terminal_log: TerminalLogEntry[];
  agent_events: AgentEvent[];
}

export interface Settings {
  ai_model: string;
}

// ---------------------------------------------------------------------------
// REST API functions
// ---------------------------------------------------------------------------
export async function fetchIncidents(): Promise<IncidentSummary[]> {
  const res = await fetch(`${API_BASE}/incidents`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch incidents: ${res.statusText}`);
  return res.json();
}

export async function fetchIncident(id: string): Promise<IncidentDetail> {
  const res = await fetch(`${API_BASE}/incidents/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch incident: ${res.statusText}`);
  return res.json();
}

export async function approveIncident(id: string): Promise<{ pr_url: string }> {
  const res = await fetch(`${API_BASE}/incidents/${id}/approve`, {
    method: "POST",
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error || `Failed to approve: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchSettings(): Promise<Settings> {
  const res = await fetch(`${API_BASE}/settings`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch settings: ${res.statusText}`);
  return res.json();
}

export async function updateSettings(settings: Partial<Settings>): Promise<Settings> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error(`Failed to update settings: ${res.statusText}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// SSE subscription — real-time event stream for a single incident
// ---------------------------------------------------------------------------
/**
 * Subscribe to the real-time SSE stream for an incident.
 * Returns a cleanup function that closes the EventSource.
 */
export function subscribeToIncident(
  id: string,
  onEvent: (event: SSEEvent) => void,
  onError?: (err: Event) => void,
): () => void {
  const url = `${API_BASE}/incidents/${id}/stream`;
  const es = new EventSource(url);

  // All known SSE event types emitted by the backend
  const eventTypes = [
    "status",
    "status_change",
    "model_request",
    "agent_thought",
    "tool_call",
    "tool_result",
    "investigation_complete",
    "agent_complete",
    "error",
    "sandbox_status",
    "sandbox_phase",
    "sandbox_output",
    "sandbox_exit",
    "sandbox_complete",
    "sandbox_error",
    "done",
  ];

  const handler = (e: MessageEvent) => {
    try {
      const parsed = JSON.parse(e.data) as SSEEvent;
      onEvent(parsed);
    } catch {
      // Ignore malformed events
    }
  };

  for (const type of eventTypes) {
    es.addEventListener(type, handler);
  }

  // Also handle generic message events as a fallback
  es.onmessage = handler;

  es.onerror = (err) => {
    onError?.(err);
  };

  return () => {
    es.close();
  };
}
