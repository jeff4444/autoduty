"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertTriangle, CreditCard } from "lucide-react";
import StoreNav from "@/components/store-nav";
import CouponInput from "@/components/coupon-input";
import { useCart } from "@/lib/cart-context";

export default function CheckoutPage() {
  const { items, totalPrice, totalItems } = useCart();
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zip: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<{
    discountedTotal: number;
    savings: number;
    code: string;
  } | null>(null);

  const handleCouponApplied = (discountedTotal: number, savings: number, code: string) => {
    setCouponDiscount({ discountedTotal, savings, code });
  };

  const finalTotal = couponDiscount ? couponDiscount.discountedTotal : totalPrice;
  const shipping = finalTotal >= 50 ? 0 : 9.99;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.name,
            email: form.email,
            address: form.address,
            city: form.city,
            zip: form.zip,
          },
          items: items.map((item) => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          total: totalPrice,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Something went wrong processing your order.");
      }

      // This path won't be reached due to the bug, but here for completeness
      window.location.href = "/checkout?success=true";
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <StoreNav />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-4">
          <p className="text-muted-foreground text-lg">Your cart is empty</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-lg text-sm font-medium transition"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StoreNav />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {/* Error toast */}
        {error && (
          <div className="mb-6 flex items-start gap-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-4">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Order failed</p>
              <p className="text-sm mt-0.5 opacity-90">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Form */}
          <form onSubmit={handleSubmit} className="md:col-span-3 space-y-5">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
              Shipping Information
            </h2>

            <div>
              <label className="block text-sm font-medium mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="john@example.com"
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Address</label>
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="123 Main St"
                className="w-full px-4 py-2.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">City</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="San Francisco"
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">ZIP Code</label>
                <input
                  type="text"
                  required
                  value={form.zip}
                  onChange={(e) => setForm({ ...form, zip: e.target.value })}
                  placeholder="94102"
                  className="w-full px-4 py-2.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 disabled:opacity-60 text-accent-foreground px-6 py-3.5 rounded-lg text-sm font-medium transition mt-4"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" /> Place Order — $
                  {(finalTotal + shipping).toFixed(2)}
                </>
              )}
            </button>
          </form>

          {/* Order summary */}
          <div className="md:col-span-2">
            <div className="border border-border rounded-xl p-5 space-y-4 sticky top-24">
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Order Summary
              </h2>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>

                {/* Coupon Code */}
                <div className="py-2">
                  <CouponInput subtotal={totalPrice} onApplied={handleCouponApplied} />
                </div>

                {couponDiscount && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Discount ({couponDiscount.code})</span>
                    <span>-${couponDiscount.savings.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-border">
                  <span>Total</span>
                  <span>${(finalTotal + shipping).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
