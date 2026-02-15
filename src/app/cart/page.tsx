"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag } from "lucide-react";
import StoreNav from "@/components/store-nav";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <div className="min-h-screen flex flex-col">
      <StoreNav />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </Link>

        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 space-y-4">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto" />
            <p className="text-muted-foreground text-lg">Your cart is empty</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-lg text-sm font-medium transition"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Items */}
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border border-border rounded-xl p-4"
                >
                  <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-muted shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.id}`}
                      className="font-semibold text-sm hover:text-accent transition truncate block"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 border border-border rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:bg-muted rounded-l-lg transition"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:bg-muted rounded-r-lg transition"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <p className="font-bold text-sm w-20 text-right">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span>{totalPrice >= 50 ? "Free" : "$9.99"}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-border pt-4">
                <span>Total</span>
                <span>${(totalPrice + (totalPrice >= 50 ? 0 : 9.99)).toFixed(2)}</span>
              </div>
              <Link
                href="/checkout"
                className="block w-full text-center bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3.5 rounded-lg text-sm font-medium transition"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
