"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "lucide-react";
import type { TerminalLogEntry } from "@/lib/api";

interface TerminalViewerProps {
  lines: TerminalLogEntry[];
  streaming?: boolean;
  /** Legacy fallback: plain text sandbox output */
  legacyOutput?: string | null;
}

export default function TerminalViewer({ lines, streaming = false, legacyOutput }: TerminalViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  // Auto-scroll on new lines
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines.length, streaming]);

  // Compute unique labels (phase tabs)
  const labels = Array.from(new Set(lines.map((l) => l.label).filter(Boolean)));

  // Pick first label on mount if not set
  useEffect(() => {
    if (labels.length > 0 && !activeLabel) {
      setActiveLabel(labels[0]);
    }
  }, [labels, activeLabel]);

  const filteredLines = activeLabel
    ? lines.filter((l) => l.label === activeLabel)
    : lines;

  // If no structured lines but legacy output exists, render that
  if (lines.length === 0 && legacyOutput) {
    return (
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-card">
          <Terminal className="w-4 h-4 text-success" />
          <span className="text-sm font-medium">Sandbox Output</span>
        </div>
        <div className="bg-[#09090b] p-4 overflow-x-auto max-h-64 overflow-y-auto">
          <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">{legacyOutput}</pre>
        </div>
      </div>
    );
  }

  if (lines.length === 0 && !streaming) return null;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      {/* Header with optional phase tabs */}
      <div className="flex items-center border-b border-border bg-card">
        <div className="flex items-center gap-2 px-4 py-2.5">
          <Terminal className="w-4 h-4 text-success" />
          <span className="text-sm font-medium">Sandbox Output</span>
        </div>
        {labels.length > 1 && (
          <div className="flex items-center gap-0 ml-auto">
            {labels.map((label) => (
              <button
                key={label}
                onClick={() => setActiveLabel(label)}
                className={`px-3 py-2.5 text-[11px] font-mono transition border-b-2 ${
                  activeLabel === label
                    ? "border-accent text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        {streaming && (
          <span className="flex items-center gap-1.5 ml-auto mr-4">
            <span className="streaming-pulse w-2 h-2 rounded-full bg-success" />
            <span className="text-[11px] text-success">Live</span>
          </span>
        )}
      </div>

      {/* Terminal output area */}
      <div ref={scrollRef} className="bg-[#09090b] p-4 overflow-x-auto max-h-72 overflow-y-auto">
        {filteredLines.map((line, i) => (
          <div key={i} className="group flex gap-0">
            <span className="text-[10px] text-muted-foreground/30 font-mono w-16 shrink-0 text-right pr-3 select-none opacity-0 group-hover:opacity-100 transition">
              {formatTS(line.timestamp)}
            </span>
            <pre
              className={`text-xs font-mono whitespace-pre-wrap break-all ${
                line.stream === "stderr" ? "text-destructive/80" : "text-muted-foreground"
              }`}
            >
              {line.data}
            </pre>
          </div>
        ))}
        {streaming && (
          <span className="terminal-cursor inline-block w-2 h-4 bg-success/80 ml-0.5" />
        )}
      </div>
    </div>
  );
}

function formatTS(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return "";
  }
}
