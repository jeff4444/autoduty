/**
 * API Route: GET /api/products
 *
 * Returns the full product catalog with featured items prioritized.
 */

import { NextResponse } from "next/server";
import { products } from "@/lib/products";
import { withAutoduty } from "@/lib/error-reporter";

async function handler() {
  const featured = products.filter((p) => (p as any).metadata.featured === true);
  const rest = products.filter((p) => !(p as any).metadata.featured);
  return NextResponse.json({ products: [...featured, ...rest] });
}

export const GET = withAutoduty(handler, "src/app/api/products/route.ts", [
  "src/lib/products.ts",
]);
