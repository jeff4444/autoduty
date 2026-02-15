/**
 * Shared pricing/discount utilities.
 *
 * MULTI-FILE BUG: `applyDiscount` expects `discount` to be an object with
 * `{ type, value }` but the API route in `/api/coupons/validate/route.ts`
 * passes the raw coupon code string instead of the looked-up discount object.
 * This causes: TypeError: Cannot read properties of undefined (reading 'type')
 *
 * Fixing requires:
 * 1. `api/coupons/validate/route.ts` — look up the coupon before passing to applyDiscount
 * 2. `lib/pricing.ts` — add validation to guard against wrong input types
 */

export interface Discount {
  type: "percentage" | "flat";
  value: number;
}

export function applyDiscount(subtotal: number, discount: Discount): number {
  // BUG: No validation — if discount is not the right shape, this blows up
  if (discount.type === "percentage") {
    return subtotal * (1 - discount.value / 100);
  } else if (discount.type === "flat") {
    return Math.max(0, subtotal - discount.value);
  }
  return subtotal;
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function calculateTax(subtotal: number, rate: number = 0.0875): number {
  return Math.round(subtotal * rate * 100) / 100;
}
