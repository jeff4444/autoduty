"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShoppingCart, Check, Star } from "lucide-react";
import StoreNav from "@/components/store-nav";
import ProductReviews from "@/components/product-reviews";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/products";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data.product);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <StoreNav />
        <div className="max-w-7xl mx-auto px-6 py-10 animate-pulse">
          <div className="h-4 bg-muted rounded w-32 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="aspect-square bg-muted rounded-xl" />
            <div className="space-y-4">
              <div className="h-3 bg-muted rounded w-20" />
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-6 bg-muted rounded w-24" />
              <div className="h-20 bg-muted rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <StoreNav />
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
          <p className="text-muted-foreground">Product not found.</p>
          <Link href="/products" className="text-accent hover:underline text-sm mt-2 inline-block">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <StoreNav />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <Link
          href="/products"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Image */}
          <div className="aspect-square relative bg-muted rounded-xl overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                {product.category}
              </p>
              <h1 className="text-3xl font-bold">{product.name}</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(product.rating)
                        ? "text-warning fill-warning"
                        : "text-border"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviews.toLocaleString()} reviews)
              </span>
            </div>

            <p className="text-3xl font-bold">${product.price.toFixed(2)}</p>

            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            <div className="flex items-center gap-2 text-sm text-success">
              <Check className="w-4 h-4" />
              In Stock — Ships within 2 business days
            </div>

            <div className="flex gap-4 pt-2">
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 rounded-lg text-sm font-medium transition"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </button>
              <Link
                href="/cart"
                className="border border-border hover:border-accent/50 px-6 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
                View Cart
              </Link>
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <ProductReviews productId={product.id} />
      </main>
    </div>
  );
}
