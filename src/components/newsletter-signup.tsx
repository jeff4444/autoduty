"use client";

import { useState } from "react";
import { Mail, Loader2, AlertTriangle, Check } from "lucide-react";

export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to subscribe");
      }

      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not subscribe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-muted/50 border-t border-border py-10 px-6">
      <div className="max-w-xl mx-auto text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Mail className="w-5 h-5 text-accent" />
          <h3 className="font-semibold">Stay in the loop</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Get notified about new products, deals, and tech news. No spam, ever.
        </p>

        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-accent hover:bg-accent/90 disabled:opacity-60 text-accent-foreground px-5 py-2.5 rounded-lg text-sm font-medium transition"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : success ? (
              <Check className="w-4 h-4" />
            ) : (
              "Subscribe"
            )}
          </button>
        </form>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-sm justify-center">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {success && (
          <p className="text-sm text-success">You&apos;re subscribed! Check your inbox.</p>
        )}
      </div>
    </div>
  );
}
