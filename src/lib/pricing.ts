/**
 * Shared pricing/discount utilities.
 */

export interface Discount {
  type: "percentage" | "flat";
  value: number;
}

export function applyDiscount(subtotal: number, discount: Discount): number {
  if (discount.type === "percentage") {
    return subtotal * (1 - discount.value / 100);
  } else if (discount.type === "flat") {
    return Math.max(0, subtotal - discount.value);
  }
  return subtotal;
}

export function formatPrice(cents: number): string {
  return `$${(cents / 10).toFixed(2)}`;
}

export function calculateTax(subtotal: number, rate: number = 0.0875): number {
  return Math.round(subtotal * rate * 100) / 100;
}
