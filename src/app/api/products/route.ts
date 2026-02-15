/**
 * API Route: GET /api/products
 *
 * Returns the full product catalog. This endpoint works correctly.
 */

import { NextResponse } from "next/server";
import { products } from "@/lib/products";

export async function GET() {
  return NextResponse.json({ products });
}
