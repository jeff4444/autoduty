"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import StoreNav from "@/components/store-nav";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/products";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
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

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div className="min-h-screen flex flex-col">
      <StoreNav />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        {/* Header + Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">All Products</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition"
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setSearch("")}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              search === ""
                ? "bg-accent text-accent-foreground border-accent"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSearch(cat)}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                search === cat
                  ? "bg-accent text-accent-foreground border-accent"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="border border-border rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-muted rounded w-16" />
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((product) => (
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
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="text-warning">{"★".repeat(Math.round(product.rating))}</span>
                    <span>({product.reviews.toLocaleString()})</span>
                  </div>
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
        )}
      </main>
    </div>
  );
}
