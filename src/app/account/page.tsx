"use client";

import { useEffect, useState } from "react";
import { User, Mail, ShoppingBag, Loader2, AlertTriangle } from "lucide-react";
import StoreNav from "@/components/store-nav";

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

  return (
    <div className="min-h-screen flex flex-col">
      <StoreNav />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
            <User className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Account</h1>
            <p className="text-sm text-muted-foreground">Manage your profile and orders</p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground py-10 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading your account...
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-5">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Something went wrong</p>
              <p className="text-sm mt-1 opacity-90">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && users.length > 0 && (
          <div className="space-y-6">
            <div className="border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Profile Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{users[0].name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{users[0].email}</span>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Order History
              </h2>
              <div className="flex items-center gap-3 text-muted-foreground py-4">
                <ShoppingBag className="w-5 h-5" />
                <p className="text-sm">No orders yet. Start shopping!</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
