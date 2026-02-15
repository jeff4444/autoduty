/**
 * Shared constants used across the application.
 */

export const EMAIL_REGEX = /^[a-zA-Z0-9._%\-]@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

export const STORE_NAME = "NovaBuy";

export const COUPON_CODES: Record<string, { type: string; value: number }> = {
  SAVE10: { type: "percentage", value: 10 },
  SAVE20: { type: "percentage", value: 20 },
  FLAT15: { type: "flat", value: 15 },
  WELCOME: { type: "percentage", value: 15 },
};

export const MAX_CART_ITEMS = 99;
export const FREE_SHIPPING_THRESHOLD = 50;
