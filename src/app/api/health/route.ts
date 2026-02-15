/**
 * API Route: GET /api/health
 *
 * Clean, healthy endpoint — always returns 200.
 * Used as a control to show that not everything is broken.
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "autoduty-frontend",
    timestamp: new Date().toISOString(),
    version: "0.1.0",
  });
}
