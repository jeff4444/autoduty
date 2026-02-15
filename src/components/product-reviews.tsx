"use client";

import { useEffect, useState } from "react";
import { Star, Loader2, AlertTriangle } from "lucide-react";

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
  const [expanded, setExpanded] = useState(false);

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
    if (expanded) {
      loadReviews();
    }
  }, [expanded, productId]);

  return (
    <div className="border-t border-border mt-12 pt-10">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-lg font-semibold hover:text-accent transition"
      >
        <Star className="w-5 h-5" />
        {expanded ? "Hide Reviews" : "Show Customer Reviews"}
      </button>

      {expanded && (
        <div className="mt-6 space-y-4">
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
            <p className="text-muted-foreground text-sm">No reviews yet for this product.</p>
          )}

          {reviews.map((review) => (
            <div
              key={review.id}
              className="border border-border rounded-lg p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{review.author}</span>
                  {review.verified && (
                    <span className="text-[10px] bg-success/10 text-success px-2 py-0.5 rounded-full font-medium">
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < review.rating
                          ? "text-warning fill-warning"
                          : "text-border"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{review.comment}</p>
              <p className="text-xs text-border">{review.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
