/**
 * API client for communicating with the AutoDuty backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_AUTODUTY_API || "http://localhost:5001";

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
}

export interface Settings {
  llm_provider: string;
}

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
