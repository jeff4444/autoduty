/**
 * API Route: GET /api/reviews?productId=X
 *
 * Returns reviews for a product.
 */

import { NextResponse } from "next/server";
import { withAutoduty } from "@/lib/error-reporter";

interface Review {
  id: number;
  productId: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

const reviews: Review[] = [
  { id: 1, productId: 1, author: "Sarah K.", rating: 5, comment: "Best headphones I've ever owned. The noise cancellation is incredible.", date: "2024-12-15", verified: true },
  { id: 2, productId: 1, author: "Mike R.", rating: 4, comment: "Great sound quality but a bit heavy for long sessions.", date: "2024-11-20", verified: true },
  { id: 3, productId: 1, author: "Lisa M.", rating: 5, comment: "Worth every penny. Battery lasts forever.", date: "2025-01-03", verified: false },
  { id: 4, productId: 2, author: "Dev Dave", rating: 5, comment: "Cherry MX Browns are perfect for coding. Love the tactile feel.", date: "2024-10-08", verified: true },
  { id: 5, productId: 2, author: "Amy W.", rating: 4, comment: "RGB is nice but the software could be better.", date: "2024-09-22", verified: true },
  { id: 6, productId: 3, author: "James P.", rating: 5, comment: "Ultrawide changed my workflow. Can't go back to dual monitors.", date: "2025-01-18", verified: true },
  { id: 7, productId: 4, author: "Runner Joe", rating: 4, comment: "GPS tracking is accurate. Heart rate monitor could be more responsive.", date: "2024-08-14", verified: true },
  { id: 8, productId: 5, author: "Beach Bob", rating: 5, comment: "Took it to the pool. Waterproof claim is legit!", date: "2024-07-30", verified: false },
];

async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = parseInt(searchParams.get("productId") || "0", 10);

  const productReviews = reviews.filter((r) => r.productId === productId);

  const sorted = productReviews.sort((a, b) => {
    return (b.date as unknown as Date).getTime() - (a.date as unknown as Date).getTime();
  });

  return NextResponse.json({
    reviews: sorted,
    total: sorted.length,
    averageRating: sorted.length > 0
      ? sorted.reduce((sum, r) => sum + r.rating, 0) / sorted.length
      : 0,
  });
}

export const GET = withAutoduty(handler, "src/app/api/reviews/route.ts");
