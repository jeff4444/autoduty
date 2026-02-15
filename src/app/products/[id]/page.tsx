"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShoppingCart, Star } from "lucide-react";
import StoreNav, { StoreFooter } from "@/components/store-nav";
import ProductReviews from "@/components/product-reviews";
import { useCart } from "@/lib/cart-context";
import { motion } from "framer-motion";
import type { Product } from "@/lib/products";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <StoreNav />
        <div className="container py-8 animate-pulse">
          <div className="h-9 bg-muted rounded w-24 mb-6" />
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-3 bg-muted rounded w-20" />
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-32" />
              <div className="h-8 bg-muted rounded w-24" />
              <div className="h-20 bg-muted rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <StoreNav />
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Product not found.</p>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 mt-4 h-10 px-4 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreNav />

      <main className="flex-1">
        <div className="container py-8">
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 mb-6 h-9 px-3 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Products
          </Link>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="aspect-square rounded-lg overflow-hidden bg-muted relative"
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {product.category}
              </p>
              <h1 className="text-3xl font-bold mt-1">{product.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-nova text-nova" />
                  <span className="font-medium">{product.rating}</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  ({product.reviews.toLocaleString()} reviews)
                </span>
              </div>
              <p className="text-3xl font-bold mt-6">${product.price.toFixed(2)}</p>
              <span
                className={`inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold mt-2 w-fit ${
                  product.inStock
                    ? "bg-success/15 text-success"
                    : "bg-destructive/15 text-destructive"
                }`}
              >
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
              <p className="text-muted-foreground mt-6 leading-relaxed">
                {product.description}
              </p>
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
                className="inline-flex items-center justify-center gap-2 mt-8 w-full sm:w-auto h-11 px-8 rounded-md text-sm font-semibold bg-nova text-nova-foreground hover:bg-nova/90 shadow-lg shadow-nova/25 transition-colors disabled:pointer-events-none disabled:opacity-50"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.inStock ? "Add to Cart" : "Sold Out"}
              </button>
            </motion.div>
          </div>

          {/* Reviews */}
          <ProductReviews productId={product.id} />
        </div>
      </main>

      <StoreFooter />
    </div>
  );
}
