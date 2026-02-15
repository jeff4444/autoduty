"use client";

import Link from "next/link";
import { ShoppingCart, Store, Search, User } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export default function StoreNav() {
  const { totalItems } = useCart();

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Store className="w-6 h-6 text-accent" />
          <span className="text-xl font-bold tracking-tight">NovaBuy</span>
        </Link>

        {/* Center nav */}
        <div className="hidden sm:flex items-center gap-8">
          <Link
            href="/products"
            className="text-sm text-muted-foreground hover:text-foreground transition"
          >
            Products
          </Link>
          <Link
            href="/products"
            className="text-sm text-muted-foreground hover:text-foreground transition flex items-center gap-1"
          >
            <Search className="w-3.5 h-3.5" />
            Search
          </Link>
          <Link
            href="/account"
            className="text-sm text-muted-foreground hover:text-foreground transition flex items-center gap-1"
          >
            <User className="w-3.5 h-3.5" />
            Account
          </Link>
        </div>

        {/* Cart */}
        <Link
          href="/cart"
          className="relative flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="hidden sm:inline">Cart</span>
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
