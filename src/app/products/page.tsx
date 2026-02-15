"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Star, Search } from "lucide-react";
import StoreNav, { StoreFooter } from "@/components/store-nav";
import { useCart } from "@/lib/cart-context";
import { motion } from "framer-motion";
import type { Product } from "@/lib/products";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = useMemo(() => [...new Set(products.map((p) => p.category))], [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !activeCategory || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, activeCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreNav />

      <main className="flex-1">
        <div className="container py-8">
          <h1 className="text-3xl font-bold">All Products</h1>
          <p className="text-muted-foreground mt-1">Browse our full catalog</p>

          {/* Filters */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setActiveCategory(null)}
                className={`inline-flex items-center justify-center h-9 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeCategory === null
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`inline-flex items-center justify-center h-9 px-3 rounded-md text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-card overflow-hidden animate-pulse"
                >
                  <div className="aspect-square bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-muted rounded w-16" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-12" />
                    <div className="h-4 bg-muted rounded w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group rounded-lg border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <Link href={`/products/${product.id}`} className="block">
                    <div className="aspect-square overflow-hidden bg-muted relative">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        loading="lazy"
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {product.category}
                    </p>
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold mt-1 group-hover:text-nova transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3.5 w-3.5 fill-nova text-nova" />
                      <span className="text-sm font-medium">{product.rating}</span>
                      <span className="text-xs text-muted-foreground">
                        ({product.reviews.toLocaleString()})
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
                      <button
                        disabled={!product.inStock}
                        onClick={() =>
                          addItem({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                          })
                        }
                        className={`inline-flex items-center justify-center h-9 px-3 rounded-md text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 ${
                          product.inStock
                            ? "bg-nova text-nova-foreground hover:bg-nova/90 shadow-lg shadow-nova/25"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {product.inStock ? (
                          <ShoppingCart className="h-4 w-4" />
                        ) : (
                          "Sold Out"
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <p className="text-center text-muted-foreground mt-12">No products found.</p>
          )}
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
