"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag, Truck, Shield } from "lucide-react";
import StoreNav from "@/components/store-nav";
import NewsletterSignup from "@/components/newsletter-signup";
import { products } from "@/lib/products";
import { useCart } from "@/lib/cart-context";

export default function HomePage() {
  const { addItem } = useCart();
  const featured = products.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <StoreNav />

      {/* Hero */}
      <section className="bg-gradient-to-br from-accent/5 to-background py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-6">
          <span className="text-xs font-medium text-accent uppercase tracking-widest">
            New arrivals just dropped
          </span>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight max-w-3xl">
            Tech that works as hard as you do.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            Premium headphones, keyboards, monitors, and more — handpicked for developers and creators.
          </p>
          <div className="flex gap-4 pt-2">
            <Link
              href="/products"
              className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-6 py-3 rounded-lg text-sm font-medium transition"
            >
              Shop All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-border py-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <Truck className="w-5 h-5 text-accent" />
            <p className="text-sm font-medium">Free Shipping Over $50</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            <p className="text-sm font-medium">2-Year Warranty</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-accent" />
            <p className="text-sm font-medium">30-Day Returns</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <Link
              href="/products"
              className="text-sm text-accent hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <div
                key={product.id}
                className="group border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link href={`/products/${product.id}`}>
                  <div className="aspect-square relative bg-muted overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                </Link>
                <div className="p-4 space-y-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    {product.category}
                  </p>
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-semibold text-sm leading-snug hover:text-accent transition">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-between pt-1">
                    <p className="font-bold">${product.price.toFixed(2)}</p>
                    <button
                      onClick={() =>
                        addItem({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                        })
                      }
                      className="text-xs bg-accent hover:bg-accent/90 text-accent-foreground px-3 py-1.5 rounded-lg transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSignup />

      {/* Footer */}
      <footer className="mt-auto border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>2026 NovaBuy. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/products" className="hover:text-foreground transition">Products</Link>
            <Link href="/cart" className="hover:text-foreground transition">Cart</Link>
            <Link href="/account" className="hover:text-foreground transition">Account</Link>
            <span className="text-border">|</span>
            <Link href="/admin/dashboard" className="hover:text-foreground transition">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
