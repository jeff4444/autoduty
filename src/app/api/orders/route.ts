/**
 * API Route: GET /api/orders
 *
 * BUG: Calls `.toLowerCase()` on `order.status` which can be `undefined`
 * for some orders. This causes a TypeError on those entries.
 */

import { NextResponse } from "next/server";
import { withAutoduty } from "@/lib/error-reporter";

interface Order {
  id: number;
  customer: string;
  amount: number;
  status?: string; // NOTE: status is optional but the code assumes it exists
}

// Simulated database response — note: order #3 has no status field
function fetchOrdersFromDB(): Order[] {
  return [
    { id: 101, customer: "Alice Johnson", amount: 59.99, status: "COMPLETED" },
    { id: 102, customer: "Bob Smith", amount: 149.50, status: "PENDING" },
    { id: 103, customer: "Charlie Brown", amount: 299.00 },            // BUG: missing status
    { id: 104, customer: "Diana Prince", amount: 89.99, status: "SHIPPED" },
  ];
}

async function handler(request: Request) {
  const orders = fetchOrdersFromDB();

  // BUG: `.toLowerCase()` on undefined status throws TypeError
  const normalized = orders.map((order) => ({
    ...order,
    status: order.status!.toLowerCase(),  // Will throw on order #103
  }));

  return NextResponse.json({ orders: normalized });
}

export const GET = withAutoduty(handler, "src/app/api/orders/route.ts");
