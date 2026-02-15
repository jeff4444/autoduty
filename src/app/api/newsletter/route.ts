/**
 * API Route: POST /api/newsletter
 *
 * Subscribes an email to the newsletter.
 *
 * MULTI-FILE BUG: Uses `isValidEmail()` from `lib/validators.ts` which imports
 * `EMAIL_REGEX` from `lib/constants.ts`. The regex is broken — it's missing
 * the `+` quantifier, so it only matches single-character local parts.
 *
 * Any normal email like "john@example.com" fails validation, but the error
 * message says "Invalid email" which is confusing to the user.
 *
 * Fix requires editing TWO files:
 * 1. `src/lib/constants.ts` — fix the EMAIL_REGEX
 * 2. `src/lib/validators.ts` — add null guard before regex test
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

  // BUG: isValidEmail uses a broken regex from constants.ts.
  // Normal emails like "john@example.com" fail this check.
  if (!isValidEmail(email)) {
    // This error is returned as a 500 to make it look like a server-side bug
    // (the validation logic is wrong, not the user's input)
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
