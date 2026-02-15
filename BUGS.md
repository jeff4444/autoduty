# NovaBuy — Planted Bugs Reference

This document lists every intentional bug in the NovaBuy storefront, how to trigger it, and whether it requires single-file or multi-file fixes.

---

## Bug #1 — Place Order (single-file)

| | |
|---|---|
| **Type** | TypeError |
| **Files** | `src/app/api/orders/route.ts` |
| **Error** | `confirmationCode.toUpperCase is not a function` |

**How to trigger:**
1. Add any product to cart
2. Go to Cart → Proceed to Checkout
3. Fill in shipping info and click **Place Order**

**Root cause:** `generateConfirmationCode()` was refactored to return an object `{ code, generatedAt }` instead of a string, but the callsite still calls `.toUpperCase()` on it.

---

## Bug #2 — Account Page / Users API (single-file)

| | |
|---|---|
| **Type** | TypeError |
| **Files** | `src/app/api/users/route.ts` |
| **Error** | `Cannot read properties of undefined (reading 'users')` |

**How to trigger:**
1. Click **Account** in the nav bar (or go to `/account`)

**Root cause:** The mock DB returns `{ users: [...] }` but the code accesses `data.data.users` — the extra `.data` wrapper doesn't exist.

---

## Bug #3 — Product Reviews (single-file)

| | |
|---|---|
| **Type** | TypeError |
| **Files** | `src/app/api/reviews/route.ts` |
| **Error** | `review.date.getTime is not a function` |

**How to trigger:**
1. Go to any product detail page (e.g. `/products/1`)
2. Click **Show Customer Reviews**

**Root cause:** The code sorts reviews by calling `.getTime()` on `review.date`, but `date` is a string (`"2024-12-15"`), not a `Date` object.

---

## Bug #4 — Newsletter Subscribe (multi-file)

| | |
|---|---|
| **Type** | Validation / Regex bug |
| **Files** | `src/app/api/newsletter/route.ts` + `src/lib/validators.ts` + `src/lib/constants.ts` |
| **Error** | `Email validation failed unexpectedly for input: john@example.com...` |

**How to trigger:**
1. Scroll to the bottom of the homepage
2. Enter any normal email (e.g. `john@example.com`) in the **newsletter signup** form
3. Click **Subscribe**

**Root cause (spans 2 files):**
- `src/lib/constants.ts` — The `EMAIL_REGEX` is missing the `+` quantifier after the character class. It only matches single-character local parts (e.g. `a@example.com` works but `john@example.com` doesn't).
- `src/lib/validators.ts` — `isValidEmail()` imports the broken regex and has no guard for null/undefined input.

**Fix requires edits to:**
1. `src/lib/constants.ts` — Add `+` to the regex: `/^[a-zA-Z0-9._%\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/`
2. `src/lib/validators.ts` — Add null/empty guard before running regex

---

## Bug #5 — Apply Coupon Code (multi-file)

| | |
|---|---|
| **Type** | TypeError |
| **Files** | `src/app/api/coupons/validate/route.ts` + `src/lib/pricing.ts` + `src/lib/constants.ts` |
| **Error** | `Cannot read properties of undefined (reading 'type')` |

**How to trigger:**
1. Add any product to cart
2. Go to Cart → Proceed to Checkout
3. In the order summary sidebar, enter a valid coupon code: `SAVE10`, `SAVE20`, `FLAT15`, or `WELCOME`
4. Click **Apply**

**Root cause (spans 2 files):**
- `src/app/api/coupons/validate/route.ts` — The route passes the raw coupon code string (e.g. `"SAVE10"`) to `applyDiscount()` instead of looking up `COUPON_CODES[code]` first (the discount object `{ type, value }`).
- `src/lib/pricing.ts` — `applyDiscount()` accesses `discount.type` with no validation, so it crashes when `discount` is a string.

**Fix requires edits to:**
1. `src/app/api/coupons/validate/route.ts` — Look up `COUPON_CODES[upperCode]` and pass the result to `applyDiscount()`
2. `src/lib/pricing.ts` — Add input validation in `applyDiscount()` to guard against wrong types

---

## Valid Coupon Codes (for testing Bug #5)

| Code | Discount |
|------|----------|
| `SAVE10` | 10% off |
| `SAVE20` | 20% off |
| `FLAT15` | $15 off |
| `WELCOME` | 15% off |

---

## Summary

| # | Bug | Trigger | Type | Files to fix |
|---|-----|---------|------|-------------|
| 1 | Place Order crashes | Checkout → Place Order | single-file | `api/orders/route.ts` |
| 2 | Account page crashes | Nav → Account | single-file | `api/users/route.ts` |
| 3 | Reviews crash | Product → Show Reviews | single-file | `api/reviews/route.ts` |
| 4 | Newsletter rejects valid emails | Homepage footer → Subscribe | **multi-file** | `constants.ts` + `validators.ts` |
| 5 | Coupon code crashes | Checkout → Apply coupon | **multi-file** | `api/coupons/validate/route.ts` + `pricing.ts` |
