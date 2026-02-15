/**
 * Shared validation utilities used across API routes.
 *
 * MULTI-FILE BUG: The `isValidEmail` function imports EMAIL_REGEX from
 * constants.ts, but that regex is broken (missing the `+` quantifier after
 * the character class for the local part). This causes valid emails like
 * "john@example.com" to fail validation.
 *
 * Fixing this requires editing constants.ts (the regex) AND this file
 * (which should also handle the edge case of empty strings before running regex).
 */

import { EMAIL_REGEX } from "./constants";

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return EMAIL_REGEX.test(email);
}

export function isValidZip(zip: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zip);
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}
