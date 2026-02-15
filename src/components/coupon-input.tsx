"use client";

import { useState } from "react";
import { Tag, Loader2, AlertTriangle, Check } from "lucide-react";

export default function CouponInput({
  subtotal,
  onApplied,
}: {
  subtotal: number;
  onApplied: (discountedTotal: number, savings: number, code: string) => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<string | null>(null);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), subtotal }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Invalid coupon code");
      }

      const data = await res.json();
      setApplied(data.code);
      onApplied(data.discountedTotal, data.savings, data.code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not validate coupon");
    } finally {
      setLoading(false);
    }
  };

  if (applied) {
    return (
      <div className="flex items-center gap-2 text-success text-sm py-2">
        <Check className="w-4 h-4" />
        Coupon <span className="font-bold">{applied}</span> applied!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <form onSubmit={handleApply} className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Coupon code"
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="flex items-center gap-2 bg-muted hover:bg-muted/80 disabled:opacity-40 text-foreground px-4 py-2 rounded-lg text-sm font-medium transition border border-border"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
