/**
 * API Route: POST /api/coupons/validate
 *
 * Validates a coupon code and returns the discounted total.
 *
 * MULTI-FILE BUG: The route passes the raw coupon code string to
 * `applyDiscount()` instead of looking up the discount object first.
 * `applyDiscount()` in `lib/pricing.ts` expects `{ type, value }` but
 * receives a string like "SAVE10", causing:
 * TypeError: Cannot read properties of undefined (reading 'type')
 *
 * Fix requires editing TWO files:
 * 1. `src/app/api/coupons/validate/route.ts` — look up COUPON_CODES[code] before passing
 * 2. `src/lib/pricing.ts` — add input validation in applyDiscount
 */

import { NextResponse } from "next/server";
import { withAutoduty } from "@/lib/error-reporter";
import { applyDiscount } from "@/lib/pricing";
import { COUPON_CODES } from "@/lib/constants";

async function handler(request: Request) {
  const body = await request.json();
  const { code, subtotal } = body;

  if (!code || !subtotal) {
    return NextResponse.json(
      { error: "Missing fields", message: "Coupon code and subtotal are required." },
      { status: 400 }
    );
  }

  const upperCode = code.toUpperCase().trim();

  if (!(upperCode in COUPON_CODES)) {
    return NextResponse.json(
      { error: "Invalid coupon", message: `Coupon code "${code}" is not valid.` },
      { status: 400 }
    );
  }

  // BUG: Passes `upperCode` (a string) instead of `COUPON_CODES[upperCode]` (the discount object).
  // applyDiscount expects { type, value } but gets "SAVE10".
  const discountedTotal = applyDiscount(subtotal, upperCode as unknown as { type: "percentage" | "flat"; value: number });

  return NextResponse.json({
    valid: true,
    code: upperCode,
    originalTotal: subtotal,
    discountedTotal,
    savings: subtotal - discountedTotal,
  });
}

export const POST = withAutoduty(
  handler,
  "src/app/api/coupons/validate/route.ts",
  ["src/lib/pricing.ts", "src/lib/constants.ts"]
);
