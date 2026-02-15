/**
 * API Route: GET /api/products/[id]
 *
 * Returns a single product by ID. This endpoint works correctly.
 */

import { NextResponse } from "next/server";
import { products } from "@/lib/products";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = products.find((p) => p.id === parseInt(id, 10));

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product });
}
