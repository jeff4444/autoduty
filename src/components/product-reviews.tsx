"use client";

import { useEffect, useState } from "react";
import { Star, Loader2, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";

interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export default function ProductReviews({ productId }: { productId: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReviews, setShowReviews] = useState(false);

  const loadReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to load reviews");
      }
      const data = await res.json();
      setReviews(data.reviews);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showReviews) {
      loadReviews();
    }
  }, [showReviews, productId]);

  return (
    <div className="mt-12 border-t border-border pt-8">
      <button
        onClick={() => setShowReviews(!showReviews)}
        className="flex items-center gap-2 text-lg font-semibold hover:text-nova transition-colors"
      >
        Reviews ({reviews.length})
        {showReviews ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </button>

      {showReviews && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 space-y-4"
        >
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading reviews...
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-4">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Error loading reviews</p>
                <p className="text-sm mt-0.5 opacity-90">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && reviews.length === 0 && (
            <p className="text-muted-foreground">No reviews yet.</p>
          )}

          {reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-lg border border-border p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{review.author}</span>
                <span className="text-xs text-muted-foreground">{review.date}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < review.rating
                        ? "fill-nova text-nova"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{review.comment}</p>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
