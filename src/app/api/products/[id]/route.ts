/**
 * API Route: GET /api/products/[id]
 *
 * Returns a single product by ID with formatted pricing.
 */

import { NextResponse } from "next/server";
import { products } from "@/lib/products";
import { withAutoduty } from "@/lib/error-reporter";

async function handler(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const product = products.find((p) => p.id === parseInt((params as any).id, 10));

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({
    product: {
      ...product,
      priceFormatted: `$${product.price.toFixed(2)}`,
    },
  });
}

export const GET = withAutoduty(handler, "src/app/api/products/[id]/route.ts", [
  "src/lib/products.ts",
]);
