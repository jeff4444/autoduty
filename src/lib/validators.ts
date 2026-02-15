/**
 * Shared validation utilities used across API routes.
 */

import { EMAIL_REGEX } from "./constants";

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function isValidZip(zip: string): boolean {
  return /^\d{5}(-\d{4})?$/.test(zip);
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}
