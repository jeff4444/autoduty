/**
 * API Route: POST /api/orders
 *
 * Creates a new order from the checkout form.
 *
 * BUG: The code calls `generateConfirmationCode()` which returns an object
 * `{ code: "..." }`, but then tries to call `.toUpperCase()` directly on it
 * instead of on `.code`. This causes: TypeError: confirmationCode.toUpperCase
 * is not a function.
 *
 * This is a realistic bug — a developer changed the return type of the helper
 * from a string to an object but forgot to update the callsite.
 */

import { NextResponse } from "next/server";
import { withAutoduty } from "@/lib/error-reporter";

interface OrderItem {
  productId: number;
  name: string;
  quantity: number;
  price: number;
}

interface OrderPayload {
  customer: {
    name: string;
    email: string;
    address: string;
    city: string;
    zip: string;
  };
  items: OrderItem[];
  total: number;
}

// Helper that was recently refactored to return an object instead of a string.
// The developer forgot to update the callsite.
function generateConfirmationCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Refactored: now returns an object with metadata
  return { code, generatedAt: new Date().toISOString() };
}

async function handler(request: Request) {
  const body: OrderPayload = await request.json();

  // Validate
  if (!body.customer || !body.items || body.items.length === 0) {
    return NextResponse.json(
      { error: "Invalid order", message: "Customer info and items are required." },
      { status: 400 }
    );
  }

  // Calculate total
  const calculatedTotal = body.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Generate confirmation code
  const confirmationCode = generateConfirmationCode();

  // BUG: `confirmationCode` is now an object { code, generatedAt }, not a string.
  // Calling .toUpperCase() on an object throws TypeError.
  const formattedCode = (confirmationCode as unknown as string).toUpperCase();

  // Build order (this line is never reached)
  const order = {
    id: Math.floor(Math.random() * 100000),
    confirmationCode: formattedCode,
    customer: body.customer,
    items: body.items,
    total: calculatedTotal,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({ order }, { status: 201 });
}

export const POST = withAutoduty(handler, "src/app/api/orders/route.ts");
