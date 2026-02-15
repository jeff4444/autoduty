"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertTriangle, CreditCard, Tag } from "lucide-react";
import StoreNav, { StoreFooter } from "@/components/store-nav";
import CouponInput from "@/components/coupon-input";
import { useCart } from "@/lib/cart-context";

export default function CheckoutPage() {
  const { items, totalPrice, totalItems } = useCart();
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
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
  const shipping = finalTotal >= 50 ? 0 : 4.99;
  const total = finalTotal + shipping;

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

      window.location.href = "/checkout?success=true";
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <StoreNav />
        <main className="flex-1">
          <div className="container py-16 text-center space-y-4">
            <p className="text-muted-foreground text-lg">Your cart is empty</p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 h-10 px-4 py-2 rounded-md text-sm font-semibold bg-nova text-nova-foreground hover:bg-nova/90 shadow-lg shadow-nova/25 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </main>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreNav />

      <main className="flex-1">
        <div className="container py-8">
          <Link
            href="/cart"
            className="inline-flex items-center justify-center gap-2 mb-6 h-9 px-3 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Cart
          </Link>
          <h1 className="text-3xl font-bold">Checkout</h1>

          {/* Error toast */}
          {error && (
            <div className="mt-6 flex items-start gap-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-4">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Order failed</p>
                <p className="text-sm mt-0.5 opacity-90">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping */}
              <div className="rounded-lg border border-border p-6 space-y-4">
                <h2 className="font-bold text-lg">Shipping Information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="text-sm font-medium leading-none mb-1.5 block">Full Name</label>
                    <input
                      id="name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="John Doe"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="text-sm font-medium leading-none mb-1.5 block">Email</label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="john@example.com"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="address" className="text-sm font-medium leading-none mb-1.5 block">Address</label>
                  <input
                    id="address"
                    required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="123 Main St"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="city" className="text-sm font-medium leading-none mb-1.5 block">City</label>
                    <input
                      id="city"
                      required
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="New York"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="text-sm font-medium leading-none mb-1.5 block">State</label>
                    <input
                      id="state"
                      required
                      value={form.state}
                      onChange={(e) => setForm({ ...form, state: e.target.value })}
                      placeholder="NY"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                  <div>
                    <label htmlFor="zip" className="text-sm font-medium leading-none mb-1.5 block">ZIP Code</label>
                    <input
                      id="zip"
                      required
                      value={form.zip}
                      onChange={(e) => setForm({ ...form, zip: e.target.value })}
                      placeholder="10001"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                </div>
              </div>

              {/* Coupon */}
              <div className="rounded-lg border border-border p-6">
                <h2 className="font-bold text-lg mb-4">Coupon Code</h2>
                <CouponInput subtotal={totalPrice} onApplied={handleCouponApplied} />
              </div>
            </div>

            {/* Order Summary */}
            <div className="rounded-lg border border-border p-6 h-fit space-y-4">
              <h2 className="font-bold text-lg">Order Summary</h2>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} &times; {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                {couponDiscount && (
                  <div className="flex justify-between text-success">
                    <span>Discount ({couponDiscount.code})</span>
                    <span>-${couponDiscount.savings.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
              </div>
              <div className="border-t border-border pt-4 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 w-full h-11 px-8 rounded-md text-sm font-semibold bg-nova text-nova-foreground hover:bg-nova/90 shadow-lg shadow-nova/25 transition-colors disabled:pointer-events-none disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>Place Order</>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
