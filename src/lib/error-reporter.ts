/**
 * Error Reporter — lightweight utility that reports errors from API routes
 * to the AutoDuty backend for autonomous remediation.
 */

import { readFileSync } from "fs";
import { join } from "path";

const AUTODUTY_API = process.env.AUTODUTY_BACKEND_URL || "http://localhost:5001";
const REPO_URL = process.env.GITHUB_REPO_URL || "https://github.com/your-username/autoduty";

export interface ErrorReport {
  error_type: string;
  traceback: string;
  logs: string[];
  source_file: string;
  source_code: string;
  repo_url: string;
  branch: string;
  related_files?: { path: string; content: string }[];
}

/**
 * Read the source file from disk so we can send it to the backend.
 * This runs server-side in Next.js API routes.
 */
function readSourceFile(relPath: string): string {
  try {
    const fullPath = join(process.cwd(), relPath);
    return readFileSync(fullPath, "utf-8");
  } catch {
    return "";
  }
}

export async function reportError(report: ErrorReport): Promise<void> {
  try {
    const response = await fetch(`${AUTODUTY_API}/incident`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(report),
    });

    if (!response.ok) {
      console.error(
        `[AutoDuty] Failed to report error: ${response.status} ${response.statusText}`
      );
    } else {
      const data = await response.json();
      console.log(`[AutoDuty] Incident created: ${data.id} (status: ${data.status})`);
    }
  } catch (err) {
    // Fail silently — don't break the app if the backend is down
    console.error("[AutoDuty] Could not reach backend:", err);
  }
}

/**
 * Wraps an API route handler with automatic error reporting.
 * If the handler throws, the error is caught, reported to AutoDuty, and a 500 is returned.
 */
/**
 * Wraps an API route handler with automatic error reporting.
 * If the handler throws, the error is caught, reported to AutoDuty, and a 500 is returned.
 *
 * @param handler      The API route handler function
 * @param sourceFile   Primary source file path (relative to project root)
 * @param relatedFiles Optional array of related file paths that may also be relevant to bugs
 */
export function withAutoduty(
  handler: (request: Request) => Promise<Response>,
  sourceFile: string,
  relatedFiles: string[] = []
) {
  // Read source code once at import time (server-side)
  const sourceCode = readSourceFile(sourceFile);
  const related = relatedFiles.map((f) => ({ path: f, content: readSourceFile(f) }));

  return async (request: Request): Promise<Response> => {
    try {
      const response = await handler(request);

      // If the handler returned a 5xx, report it
      if (response.status >= 500) {
        const body = await response.clone().text();
        await reportError({
          error_type: String(response.status),
          traceback: body,
          logs: [`[${new Date().toISOString()}] ${request.method} ${request.url} -> ${response.status}`],
          source_file: sourceFile,
          source_code: sourceCode,
          repo_url: REPO_URL,
          branch: "main",
          related_files: related.length > 0 ? related : undefined,
        });
      }

      return response;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      const traceback = err.stack || err.message;

      await reportError({
        error_type: "500",
        traceback,
        logs: [
          `[${new Date().toISOString()}] ${request.method} ${request.url} -> UNCAUGHT EXCEPTION`,
          traceback,
        ],
        source_file: sourceFile,
        source_code: sourceCode,
        repo_url: REPO_URL,
        branch: "main",
        related_files: related.length > 0 ? related : undefined,
      });

      return new Response(
        JSON.stringify({ error: "Internal Server Error", message: err.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  };
}
