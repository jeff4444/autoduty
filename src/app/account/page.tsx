"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, Package, ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import StoreNav, { StoreFooter } from "@/components/store-nav";

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

export default function AccountPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || "Failed to load profile");
        }
        return res.json();
      })
      .then((data) => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load account");
        setLoading(false);
      });
  }, []);

  const user = users.length > 0 ? users[0] : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreNav />

      <main className="flex-1">
        <div className="container py-8 max-w-2xl">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 mb-6 h-9 px-3 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Home
          </Link>
          <h1 className="text-3xl font-bold">My Account</h1>

          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground py-10 justify-center">
              <Loader2 className="w-5 h-5 animate-spin" />
              Loading your account...
            </div>
          )}

          {error && (
            <div className="mt-6 flex items-start gap-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-5">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Something went wrong</p>
                <p className="text-sm mt-1 opacity-90">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div className="mt-8 space-y-6">
              <div className="rounded-lg border border-border p-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-nova-muted flex items-center justify-center">
                    <User className="h-7 w-7 text-nova" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{user?.name ?? "Guest"}</h2>
                    <p className="text-sm text-muted-foreground">{user?.email ?? "Not signed in"}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-6">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" /> Order History
                </h2>
                <p className="text-muted-foreground mt-4 text-center py-8">
                  No orders yet. Start shopping!
                </p>
                <div className="text-center">
                  <Link
                    href="/products"
                    className="inline-flex items-center justify-center gap-2 h-10 px-4 py-2 rounded-md text-sm font-semibold bg-nova text-nova-foreground hover:bg-nova/90 shadow-lg shadow-nova/25 transition-colors"
                  >
                    Browse Products
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
