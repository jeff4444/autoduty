/**
 * API Route: POST /api/orders
 *
 * Creates a new order from the checkout form.
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

// Generates a unique confirmation code for each order.
function generateConfirmationCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
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

  const formattedCode = (confirmationCode as unknown as string).toUpperCase();

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
