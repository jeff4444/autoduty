"use client";

import { useState } from "react";
import { FileCode, ChevronRight } from "lucide-react";
import type { FileEdit } from "@/lib/api";

interface DiffViewerProps {
  fileEdits: FileEdit[];
}

interface DiffLine {
  type: "add" | "remove" | "context" | "hunk" | "header";
  content: string;
  oldLineNo: number | null;
  newLineNo: number | null;
}

function parseDiff(unified: string): DiffLine[] {
  const rawLines = unified.split("\n");
  const result: DiffLine[] = [];
  let oldLine = 0;
  let newLine = 0;

  for (const line of rawLines) {
    if (line.startsWith("diff ") || line.startsWith("---") || line.startsWith("+++")) {
      result.push({ type: "header", content: line, oldLineNo: null, newLineNo: null });
    } else if (line.startsWith("@@")) {
      // Parse hunk header: @@ -oldStart,oldCount +newStart,newCount @@
      const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match) {
        oldLine = parseInt(match[1], 10);
        newLine = parseInt(match[2], 10);
      }
      result.push({ type: "hunk", content: line, oldLineNo: null, newLineNo: null });
    } else if (line.startsWith("+")) {
      result.push({ type: "add", content: line.slice(1), oldLineNo: null, newLineNo: newLine });
      newLine++;
    } else if (line.startsWith("-")) {
      result.push({ type: "remove", content: line.slice(1), oldLineNo: oldLine, newLineNo: null });
      oldLine++;
    } else if (line === "\\ No newline at end of file") {
      result.push({ type: "header", content: line, oldLineNo: null, newLineNo: null });
    } else {
      // Context line (starts with space or is plain text)
      const content = line.startsWith(" ") ? line.slice(1) : line;
      if (oldLine > 0 || newLine > 0) {
        result.push({ type: "context", content, oldLineNo: oldLine, newLineNo: newLine });
        oldLine++;
        newLine++;
      }
    }
  }

  return result;
}

const LINE_TYPE_CLASSES: Record<DiffLine["type"], string> = {
  add: "diff-add",
  remove: "diff-remove",
  hunk: "diff-hunk",
  header: "text-muted-foreground bg-muted/30",
  context: "",
};

function getFileName(filePath: string): string {
  const parts = filePath.split("/");
  return parts.length > 2
    ? `.../${parts.slice(-2).join("/")}`
    : filePath;
}

export default function DiffViewer({ fileEdits }: DiffViewerProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (fileEdits.length === 0) return null;

  const activeEdit = fileEdits[activeTab];
  const lines = parseDiff(activeEdit?.unified_diff || "");

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* File tabs */}
      <div className="flex items-center gap-0 border-b border-border bg-card overflow-x-auto">
        {fileEdits.map((edit, i) => (
          <button
            key={edit.file_path}
            onClick={() => setActiveTab(i)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-mono border-b-2 transition whitespace-nowrap ${
              i === activeTab
                ? "border-accent text-foreground bg-background"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            {getFileName(edit.file_path)}
          </button>
        ))}
      </div>

      {/* Full file path */}
      <div className="px-4 py-2 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
          <ChevronRight className="w-3 h-3" />
          {activeEdit?.file_path}
        </div>
      </div>

      {/* Diff lines */}
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-xs font-mono">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className={LINE_TYPE_CLASSES[line.type]}>
                <td className="px-2 py-0 text-right select-none text-muted-foreground/50 w-12 border-r border-border/50">
                  {line.oldLineNo ?? ""}
                </td>
                <td className="px-2 py-0 text-right select-none text-muted-foreground/50 w-12 border-r border-border/50">
                  {line.newLineNo ?? ""}
                </td>
                <td className="px-1 py-0 select-none w-4 text-center">
                  {line.type === "add" ? "+" : line.type === "remove" ? "-" : ""}
                </td>
                <td className="px-2 py-0 whitespace-pre">{line.content}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
