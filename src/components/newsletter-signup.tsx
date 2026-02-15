"use client";

import { useState } from "react";
import { Send, Loader2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

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
    <section className="bg-primary text-primary-foreground">
      <div className="container py-16 text-center">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-bold">Stay in the Loop</h2>
          <p className="mt-2 text-primary-foreground/70 max-w-md mx-auto">
            Get notified about new products, deals, and tech insights.
          </p>
          {success ? (
            <p className="mt-6 text-nova font-semibold">Thanks for subscribing!</p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 rounded-md px-4 py-2 bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:ring-2 focus:ring-nova text-sm"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 h-10 px-4 py-2 rounded-md text-sm font-semibold bg-nova text-nova-foreground hover:bg-nova/90 shadow-lg shadow-nova/25 transition-colors disabled:pointer-events-none disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1" /> Subscribe
                  </>
                )}
              </button>
            </form>
          )}
          {error && (
            <div className="mt-4 flex items-center gap-2 text-destructive-foreground text-sm justify-center">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
