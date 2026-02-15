# NovaBuy -- Planted Bugs Reference (Answer Key)

This document lists every intentional bug in the NovaBuy storefront. It serves as an answer key for evaluating the AutoDuty agent's diagnostic capabilities.

---

## Bug #1 -- Place Order Crashes (single-file)

| | |
|---|---|
| **Type** | TypeError (crash) |
| **File** | `src/app/api/orders/route.ts` |
| **Error** | `confirmationCode.toUpperCase is not a function` |
| **Auto-reported** | Yes (withAutoduty) |

**How to trigger:**
1. Add any product to cart
2. Go to Cart -> Proceed to Checkout
3. Fill in shipping info and click **Place Order**

**Root cause:** `generateConfirmationCode()` returns an object `{ code, generatedAt }` instead of a string, but the callsite calls `.toUpperCase()` on the object directly.

---

## Bug #2 -- Account Page Crashes (single-file)

| | |
|---|---|
| **Type** | TypeError (crash) |
| **File** | `src/app/api/users/route.ts` |
| **Error** | `Cannot read properties of undefined (reading 'users')` |
| **Auto-reported** | Yes (withAutoduty) |

**How to trigger:**
1. Click **Account** in the nav bar (or go to `/account`)

**Root cause:** The mock DB returns `{ users: [...] }` but the code accesses `data.data.users` -- the extra `.data` wrapper doesn't exist.

---

## Bug #3 -- Product Reviews Crash (single-file)

| | |
|---|---|
| **Type** | TypeError (crash) |
| **File** | `src/app/api/reviews/route.ts` |
| **Error** | `review.date.getTime is not a function` |
| **Auto-reported** | Yes (withAutoduty) |

**How to trigger:**
1. Go to any product detail page (e.g. `/products/1`)
2. Click **Show Customer Reviews**

**Root cause:** The code sorts reviews by calling `.getTime()` on `review.date`, but `date` is a string (`"2024-12-15"`), not a `Date` object.

---

## Bug #4 -- Newsletter Rejects Valid Emails (multi-file)

| | |
|---|---|
| **Type** | Validation / Regex bug (crash) |
| **Files** | `src/app/api/newsletter/route.ts` + `src/lib/validators.ts` + `src/lib/constants.ts` |
| **Error** | `Email validation failed unexpectedly for input: john@example.com...` |
| **Auto-reported** | Yes (withAutoduty) |

**How to trigger:**
1. Scroll to the bottom of the homepage
2. Enter any normal email (e.g. `john@example.com`) in the newsletter signup form
3. Click **Subscribe**

**Root cause (spans 2 files):**
- `src/lib/constants.ts` -- `EMAIL_REGEX` is missing the `+` quantifier after the character class, so it only matches single-character local parts.
- `src/lib/validators.ts` -- `isValidEmail()` imports the broken regex and has no guard for null/undefined input.

---

## Bug #5 -- Coupon Code Crashes (multi-file)

| | |
|---|---|
| **Type** | TypeError (crash) |
| **Files** | `src/app/api/coupons/validate/route.ts` + `src/lib/pricing.ts` + `src/lib/constants.ts` |
| **Error** | `Cannot read properties of undefined (reading 'type')` |
| **Auto-reported** | Yes (withAutoduty) |

**How to trigger:**
1. Add any product to cart
2. Go to Cart -> Proceed to Checkout
3. Enter a valid coupon code: `SAVE10`, `SAVE20`, `FLAT15`, or `WELCOME`
4. Click **Apply**

**Root cause (spans 2 files):**
- `src/app/api/coupons/validate/route.ts` -- Passes the raw coupon code string (e.g. `"SAVE10"`) to `applyDiscount()` instead of looking up `COUPON_CODES[code]` first.
- `src/lib/pricing.ts` -- `applyDiscount()` accesses `discount.type` with no input validation, so it crashes when given a string.

---

## Bug #6 -- Products Listing Crashes (single-file)

| | |
|---|---|
| **Type** | TypeError (crash) |
| **File** | `src/app/api/products/route.ts` |
| **Error** | `Cannot read properties of undefined (reading 'featured')` |
| **Auto-reported** | Yes (withAutoduty) |

**How to trigger:**
1. Visit `/products` or the homepage (which fetches the product catalog)

**Root cause:** The route tries to access `p.metadata.featured` on each product, but the `Product` type defined in `src/lib/products.ts` has no `metadata` property -- it is `undefined`, so accessing `.featured` on it throws.

---

## Bug #7 -- Product Detail Page Crashes (single-file)

| | |
|---|---|
| **Type** | TypeError (crash) |
| **File** | `src/app/api/products/[id]/route.ts` |
| **Error** | `Cannot read properties of undefined (reading 'price')` or product always returns 404 |
| **Auto-reported** | Yes (withAutoduty) |

**How to trigger:**
1. Visit any product detail page (e.g. `/products/1`)

**Root cause:** In Next.js 15 app router, `params` is a `Promise` and must be awaited. The code accesses `params.id` synchronously (without `await`), which evaluates to `undefined`. `parseInt(undefined)` returns `NaN`, so `products.find()` never matches and returns `undefined`. The subsequent `product.price.toFixed(2)` then crashes.

---

## Bug #8 -- formatPrice Displays Wrong Amounts (single-file, display bug)

| | |
|---|---|
| **Type** | Logic error (no crash) |
| **File** | `src/lib/pricing.ts` |
| **Error** | Prices display 10x too high (e.g. `$2499.90` instead of `$249.99`) |
| **Auto-reported** | No -- this is a silent display bug |

**How to trigger:**
1. Any page that uses `formatPrice()` from `src/lib/pricing.ts` to render prices

**Root cause:** `formatPrice` divides by 10 instead of 100. The function treats input as cents but divides by the wrong denominator.

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

| # | Bug | Trigger | Type | Crashes | Files |
|---|-----|---------|------|---------|-------|
| 1 | Place Order crashes | Checkout -> Place Order | single-file | Yes | `api/orders/route.ts` |
| 2 | Account page crashes | Nav -> Account | single-file | Yes | `api/users/route.ts` |
| 3 | Reviews crash | Product -> Show Reviews | single-file | Yes | `api/reviews/route.ts` |
| 4 | Newsletter rejects valid emails | Homepage footer -> Subscribe | **multi-file** | Yes | `constants.ts` + `validators.ts` |
| 5 | Coupon code crashes | Checkout -> Apply coupon | **multi-file** | Yes | `api/coupons/validate/route.ts` + `pricing.ts` |
| 6 | Products listing crashes | Visit /products or homepage | single-file | Yes | `api/products/route.ts` |
| 7 | Product detail crashes | Visit /products/[id] | single-file | Yes | `api/products/[id]/route.ts` |
| 8 | Prices display 10x too high | Any page using formatPrice | single-file | No | `lib/pricing.ts` |
