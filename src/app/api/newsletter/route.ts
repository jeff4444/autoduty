/**
 * API Route: POST /api/newsletter
 *
 * Subscribes an email to the newsletter.
 */

import { NextResponse } from "next/server";
import { withAutoduty } from "@/lib/error-reporter";
import { isValidEmail, sanitizeInput } from "@/lib/validators";

async function handler(request: Request) {
  const body = await request.json();
  const email = sanitizeInput(body.email || "");

  if (!email) {
    return NextResponse.json(
      { error: "Email is required", message: "Please provide an email address." },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    throw new Error(
      `Email validation failed unexpectedly for input: ${email}. ` +
      `Regex test returned false for a seemingly valid email address.`
    );
  }

  return NextResponse.json({
    success: true,
    message: `Successfully subscribed ${email} to the newsletter!`,
  });
}

export const POST = withAutoduty(
  handler,
  "src/app/api/newsletter/route.ts",
  ["src/lib/validators.ts", "src/lib/constants.ts"]
);
