"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Truck, Shield, RotateCcw, Star, ArrowRight } from "lucide-react";
import StoreNav, { StoreFooter } from "@/components/store-nav";
import NewsletterSignup from "@/components/newsletter-signup";
import { products } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function HomePage() {
  const { addItem } = useCart();
  const featured = products.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StoreNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1400&q=80"
            alt="Premium tech products"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-r from-primary/90 via-primary/70 to-primary/40" />
        </div>
        <div className="container relative py-24 md:py-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-xl"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground leading-tight">
              Tech That <span className="text-nova">Elevates</span> Your Life
            </h1>
            <p className="mt-4 text-lg text-primary-foreground/80 leading-relaxed">
              Discover premium electronics and accessories, curated for people who demand the best.
            </p>
            <div className="mt-8 flex gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-md text-sm font-semibold bg-nova text-nova-foreground hover:bg-nova/90 shadow-lg shadow-nova/25 transition-colors"
              >
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center justify-center gap-2 h-11 px-8 rounded-md text-sm font-medium border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
              >
                View Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="border-b border-border">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders over $50" },
              { icon: Shield, title: "2-Year Warranty", desc: "On all products" },
              { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
            ].map((badge, i) => (
              <motion.div
                key={badge.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex items-center gap-4 justify-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-nova-muted">
                  <badge.icon className="h-6 w-6 text-nova" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{badge.title}</p>
                  <p className="text-sm text-muted-foreground">{badge.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Featured Products</h2>
            <p className="text-muted-foreground mt-1">Hand-picked favorites</p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md transition-colors"
          >
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product, i) => (
            <motion.div
              key={product.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
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
                    onClick={() =>
                      addItem({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                      })
                    }
                    className="inline-flex items-center justify-center h-9 px-3 rounded-md text-sm font-semibold bg-nova text-nova-foreground hover:bg-nova/90 shadow-lg shadow-nova/25 transition-colors"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSignup />

      <StoreFooter />
    </div>
  );
}
