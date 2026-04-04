# FomoPay Integration - Comprehensive Analysis

**Date:** April 4, 2026  
**Status:** Integration complete with some testing gaps  
**Testing Framework:** None currently in place

---

## 1. CURRENT IMPLEMENTATION OVERVIEW

### Architecture
The FomoPay integration is a **server-side payment gateway integration** for a Next.js tour booking application. It uses a Hosted Order model where:
- Customers initiate payments from the booking confirmation page
- Payments are processed on FomoPay's hosted checkout
- Webhooks notify the system of payment outcomes

### Integration Flow

```
Customer Booking → Confirmation Page 
  ↓ (FomoPayButton click)
→ /api/payments/fomopay/start (creates hosted order)
  ↓ (redirect to FomoPay)
→ FomoPay Checkout (payment processing)
  ↓ (on completion)
→ /booking/payment/return (client-side status check)
  ↓ (parallel webhook)
→ /api/webhooks/fomopay (updates booking status)
```

---

## 2. FILE-BY-FILE BREAKDOWN

### A. Configuration Layer (`src/lib/fomopay/config.ts`)

**Responsibility:** Environment-based configuration

**Exports:**
- `FOMO_PAY_API_BASE` - API endpoint (default: `https://ipg.fomopay.net`)
- `getFomoCredentials()` - Returns `{ mid, psk }` or `null`
- `isFomoPayConfigured()` - Boolean check
- `getPublicAppUrl()` - Public HTTPS origin for callback URLs

**Environment Variables Required:**
- `FOMO_PAY_MID` - Merchant ID
- `FOMO_PAY_PSK` - Pre-Shared Key (PSK)
- `FOMO_PAY_API_BASE` (optional) - Custom API endpoint
- `NEXT_PUBLIC_APP_URL` or `APP_URL` or `VERCEL_URL` - For callback URLs

**Robustness:** ✅ Good - handles missing credentials gracefully, URL normalization

---

### B. Authentication (`src/lib/fomopay/auth.ts`)

**Responsibility:** Basic Auth header generation

**Exports:**
- `fomoBasicAuthHeader()` - Returns base64-encoded `Basic Auth` header

**Details:**
- Uses `Buffer.from(${mid}:${psk}, 'utf8').toString('base64')`
- Throws error if credentials not configured

**Robustness:** ✅ Solid - throws on misconfiguration

---

### C. Type Definitions (`src/lib/fomopay/types.ts`)

**Type Definitions:**

```typescript
FomoOrderStatus = 'CREATED' | 'FAIL' | 'ERROR' | 'SUCCESS' | 'REFUND' | 'CLOSED'

FomoHostedOrderSuccess {
  id: string              // FomoPay order ID
  orderNo: string         // Merchant order number (bookingId)
  mode: string            // 'HOSTED'
  subject: string         // Payment description (max 64 chars)
  amount: string          // Formatted amount (e.g., "300.00")
  currencyCode: string    // 'SGD'
  status: FomoOrderStatus
  url: string             // Checkout URL
}

FomoErrorBody {
  hint: string
  message: string
}

FomoWebhookPayload {
  orderId: string
  orderNo: string
  transactionId: string
  transactionNo?: string
}
```

**Robustness:** ✅ Type-safe - comprehensive types for all API responses

---

### D. API Client (`src/lib/fomopay/client.ts`)

**Core Functions:**

#### Low-Level
- `fomoRequestJson<T>(path, init)` - Generic HTTP wrapper with auth
- `FomoPayApiError` - Custom error class with `status` and `body`

#### Hosted Order Operations
- `createHostedOrder(body)` - POST `/api/orders`
- `createOrResumeHostedOrder(body)` - POST with 5xx→PUT retry, 409 duplicate handling
- `putHostedOrder(body)` - PUT `/api/orders`
- `getOrderById(orderId)` - GET `/api/orders/{id}`
- `findOrdersByMerchantOrderNo(orderNo)` - Query by booking ID (range 0-10)

#### Transaction Queries
- `getTransaction(orderId, transactionId)` - GET transaction details
- `listOrderTransactions(orderId, filterObj)` - Query with filtering

#### Payment Status Resolution
- `resolveOrderForBooking(bookingId, fomoOrderId)` - Intelligent lookup (prefer stored ID, fallback to search)
- `isOrderPaidAtGateway(order, hintTransactionId)` - Multi-level success check:
  1. Order status === 'SUCCESS'
  2. Hint transaction is SALE + SUCCESS
  3. Primary transaction is SALE + SUCCESS
  4. Any transaction is SALE + SUCCESS

**Robustness:** ⚠️ Moderate
- Error parsing handles JSON and text responses
- Defensive transaction querying with fallbacks
- **Gap:** No request timeout configuration
- **Gap:** No retry logic on transient 5xx (only on create)

---

### E. Webhook Verification (`src/lib/fomopay/webhook.ts`)

**Implements:** FOMO Pay Web Integration v1.1.0 HMAC-SHA256 verification

**Key Function:** `verifyFomoWebhook(rawBody, authHeader)`

**Verification Steps:**

1. **Configuration check** - Credentials exist
2. **Auth header parsing** - Parses `FOMOPAY1-HMAC-SHA256` format
3. **Field validation** - Version, Credential (MID), Nonce, Timestamp, Signature
4. **Nonce replay protection** - 5-minute window (300s), auto-pruning
5. **Timestamp validation** - ±300s skew tolerance
6. **Signature verification** - HMAC-SHA256 with dual PSK support:
   - First: UTF-8 string interpretation
   - Second: Hex interpretation (if valid hex of even length)
7. **Timing-safe comparison** - `timingSafeEqual()` to prevent timing attacks

**Message Format:** `${rawBody}${timestamp}${nonce}`

**Robustness:** ✅ Excellent
- Constant-time signature comparison
- Nonce deduplication with auto-cleanup
- PSK dual interpretation (string + hex)
- Case-insensitive header parsing
- Comprehensive reason codes on failure

---

### F. API Route: Payment Initiation (`src/app/api/payments/fomopay/start/route.ts`)

**Endpoint:** `POST /api/payments/fomopay/start`

**Request Body:**
```json
{ "bookingId": "uuid" }
```

**Flow:**
1. Verify FomoPay configured (503 if not)
2. Validate JSON and bookingId
3. Fetch booking with nested tour_date and tour (name for subject)
4. Check payment_status ≠ 'paid' (409 if already paid)
5. Check for existing FOMO order in 'pending' state:
   - If status='SUCCESS' → mark booking as paid/confirmed, return `{paid: true}`
   - If status='CREATED' → return existing checkout URL
6. Build hosted order request:
   ```json
   {
     "mode": "HOSTED",
     "orderNo": bookingId,
     "subject": "${tourName} — booking ${bookingId.slice(0,8)}",
     "description": "Booking ${bookingId}",
     "amount": totalPrice.toFixed(2),
     "currencyCode": "SGD",
     "notifyUrl": "${base}/api/webhooks/fomopay",
     "returnUrl": "${base}/booking/payment/return?bookingId=${bookingId}",
     "backUrl": "${base}/booking/confirmation?bookingId=${bookingId}"
   }
   ```
7. Call `createOrResumeHostedOrder()` → handles retries
8. Store FOMO order ID in bookings table
9. Return `{ redirectUrl }`

**Response Codes:**
- 201: Success → checkout URL
- 400: Invalid JSON, missing bookingId, invalid amount
- 404: Booking not found
- 409: Already paid
- 503: FomoPay not configured
- 502: FomoPay API error

**Robustness:** ⚠️ Moderate
- Subject truncated to 64 chars safely
- Price validation (finite, > 0)
- **Gap:** No idempotency key for duplicate request handling
- **Gap:** Limited logging for debugging

---

### G. API Route: Webhook Handler (`src/app/api/webhooks/fomopay/route.ts`)

**Endpoint:** `POST /api/webhooks/fomopay`

**Signature Verification:**
- Checks multiple header variations (case-insensitive): `x-fomopay-authorization`, `X-FOMOPay-Authorization`, `X-Fomopay-Authorization`
- Uses `verifyFomoWebhook()` (see above)

**Webhook Payload Processing:**

1. Parse JSON payload
2. Validate orderId and orderNo present
3. Query full order via `getOrderById(orderId)`
4. Verify orderNo matches (prevent injection)
5. Resolve payment success via `isOrderPaidAtGateway()`
6. Build update object:
   ```typescript
   {
     fomo_order_id: order.id,
     payment_status: 'pending' | 'paid' | 'failed'
     status?: 'confirmed' (if paid)
   }
   ```
7. Update booking row atomically
8. Return 200 (even if no rows matched, but logs warning)

**Response Codes:**
- 200: Success (always)
- 400: Invalid JSON, missing fields, order mismatch
- 401: Signature verification failed (reason in body)
- 500: Database update error or booking not found
- 502: Could not query FomoPay

**Robustness:** ⚠️ Moderate
- Webhook signature verified ✅
- Order ID validation ✅
- **Gap:** Returns 200 even if booking not found (silent failure)
- **Gap:** Limited error logging

---

### H. Component: FomoPayButton (`src/components/booking/FomoPayButton.tsx`)

**Type Props:**
```typescript
{
  bookingId: string
  paid: boolean
  configured: boolean
}
```

**Client-Side Behavior:**

1. **If `paid=true`:** Display success message (green box)
2. **If `configured=false`:** Display config needed message (amber box)
3. **Else:** Display "Pay securely with FOMO Pay" button

**On Button Click:**
- Fetch `POST /api/payments/fomopay/start` with bookingId
- Response handling:
  - `data.paid=true` → Redirect to confirmation page, `router.refresh()`
  - `data.redirectUrl` → `window.location.href` (navigate to FomoPay)
  - Error → Display error message

**Robustness:** ✅ Good
- Disables button during payment
- Network error handling
- User-friendly messaging

---

### I. Page: Payment Return (`src/app/booking/payment/return/page.tsx`)

**Route:** `/booking/payment/return?bookingId={id}`

**Server-Side Actions:**

1. Validate bookingId param (redirect if missing)
2. Fetch booking with tour details
3. If FomoPay configured AND payment not yet 'paid':
   - Resolve order via `resolveOrderForBooking(bookingId, storedFomoId)`
   - Check `isOrderPaidAtGateway(order)`
   - If paid → update DB to 'paid'/'confirmed'
   - If failed state → update DB to 'failed'
4. Refresh booking data from DB
5. Render appropriate message:
   - Paid: "✓ Payment successful"
   - Failed: "✗ Payment failed"
   - Pending: "⏱ Checking status…" + `<ReturnPageRefresh />`

**Client Component:** `ReturnPageRefresh`
- Polls `router.refresh()` every 4 seconds
- Stops after 2 minutes
- Waits for webhook or UAT delays

**Robustness:** ✅ Good
- Defensive null checks
- Graceful fallback to DB state
- Polling strategy handles webhook delays
- **Gap:** No max-age cache control (could use stale-while-revalidate)

---

### J. Booking Confirmation Page (`src/app/booking/confirmation/page.tsx`)

**Route:** `/booking/confirmation?bookingId={id}`

**Renders:**
- Booking details summary
- Guest count, tour name, date, total price
- `<FomoPayButton configured={isFomoPayConfigured()} paid={isPaid} />`

**Robustness:** ✅ Solid - uses `isFomoPayConfigured()` to gracefully show/hide payment option

---

### K. Database Migration (`supabase/migrations/20260328120000_booking_fomo_pay.sql`)

**Adds to `bookings` table:**

```sql
fomo_order_id TEXT
  -- FomoPay-issued order ID (for lookup/resume)

payment_status TEXT DEFAULT 'unpaid'
  -- Enum: 'unpaid' | 'pending' | 'paid' | 'failed'
```

**Robustness:** ✅ Safe - uses `if not exists`, defaults specified

---

## 3. OVERALL ARCHITECTURE ASSESSMENT

### ✅ Strengths

1. **Type Safety** - Full TypeScript, no `any` types in core logic
2. **Webhook Security** - HMAC-SHA256 with nonce replay protection, timing-safe comparison
3. **Idempotency** - Duplicate order checks (409 → resume), nonce dedup
4. **Graceful Degradation** - Works without credentials (shows message)
5. **Multi-State Handling** - Tracks unpaid/pending/paid/failed states
6. **Fallback Resolution** - Multiple methods to get payment status (stored ID, merchant order search, transaction query)
7. **Error Types** - Custom `FomoPayApiError` with status codes
8. **Configuration Flexibility** - Supports multiple URL sources (env, Vercel)

### ⚠️ Gaps & Risks

| Area | Issue | Risk | Recommendation |
|------|-------|------|-----------------|
| **Testing** | Zero test coverage | No confidence in edge cases | Add unit + integration tests |
| **Error Logging** | Minimal logging | Hard to debug in production | Add structured logging |
| **Timeouts** | No request timeouts | Hanging requests possible | Set fetch timeout (5-15s) |
| **Retries** | Only on create (5xx) | Transient failures on query | Add exponential backoff for queries |
| **Idempotency Keys** | None on create | Duplicate orders if client retries | Add client-generated UUID |
| **Webhook Race Conditions** | Returns 200 even if booking not found | Silent failures | Check update count, log warnings |
| **Cache Headers** | Return page not cached | May show stale state briefly | Consider Cache-Control headers |
| **Signature Validation** | PSK formats supported but undocumented | Confusion on setup | Document PSK format expectations |
| **Host Validation** | No check for webhook origin | Potential webhook injection | Consider IP allowlisting or custom token |
| **Concurrency** | No locking on booking updates | Race condition if webhook + return both update | Use DB-level locking or optimistic concurrency |

---

## 4. DATA FLOW SECURITY ANALYSIS

### Sensitive Data Handling

| Data | Location | Risk | Mitigation |
|------|----------|------|-----------|
| **PSK** | `process.env.FOMO_PAY_PSK` | Hardcoded risk | ✅ Env-based (no hardcoding found) |
| **MID** | `process.env.FOMO_PAY_MID` | Leakage risk | ⚠️ Could be logged; recommend masking |
| **Auth Header** | Network traffic | Interception | ✅ Only HTTPS in production |
| **Webhook Signature** | Verified on receipt | ✅ HMAC-SHA256 verified |
| **Booking Data** | DB + Network | ✅ Encrypted at rest (Supabase) |

### Validated Against

- ✅ Signature verification per spec (v1.1.0)
- ✅ Nonce replay protection
- ✅ Timestamp validation (±300s)
- ⚠️ No CSRF checks (webhook endpoint public, but signature-gated)
- ⚠️ No rate limiting on endpoints

---

## 5. ENVIRONMENT SETUP CHECKLIST

**Required before production:**

```bash
# .env.local or deployment env
FOMO_PAY_MID="your_merchant_id"
FOMO_PAY_PSK="your_pre_shared_key_or_hex"
FOMO_PAY_API_BASE="https://ipg.fomopay.net"  # or custom staging URL
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

**Optional:**
- `APP_URL` - Fallback if `NEXT_PUBLIC_APP_URL` not set
- `VERCEL_URL` - Auto-populated in Vercel deployments

**Webhook Configuration in FomoPay Console:**
- Notify URL: `https://yourdomain.com/api/webhooks/fomopay`
- Return URL: Not needed (client redirects to `/booking/payment/return`)
- Webhook headers: Will include `X-FOMOPay-Authorization: FOMOPAY1-HMAC-SHA256 ...`

---

## 6. TESTING REQUIREMENTS FOR SIGN-OFF

### 6.1 Unit Tests (Missing)

**Recommended Coverage:**

```typescript
// src/lib/fomopay/__tests__/config.test.ts
- getFomoCredentials() with/without env vars
- isFomoPayConfigured() true/false
- getPublicAppUrl() from various sources
- URL normalization (trailing slashes)

// src/lib/fomopay/__tests__/auth.test.ts
- fomoBasicAuthHeader() generates correct base64
- Throws on missing credentials
- Handles special chars in PSK

// src/lib/fomopay/__tests__/webhook.test.ts
- verifyFomoWebhook() with valid signature
- Rejects bad version, credential, nonce, timestamp, signature
- Nonce replay detection
- Timestamp skew validation (±300s)
- PSK both UTF-8 and hex formats
- Case-insensitive header names

// src/lib/fomopay/__tests__/client.test.ts
- fomoRequestJson() success & error cases
- FomoPayApiError structure
- createOrResumeHostedOrder() retry logic:
  - 5xx → PUT retry
  - 409 → resume existing order
  - Other errors → throw
- Order query functions return correct types
- isOrderPaidAtGateway() with various order statuses
```

### 6.2 Integration Tests (Missing)

```typescript
// API route tests
- POST /api/payments/fomopay/start
  ✓ Creates hosted order
  ✓ Resumes existing pending order
  ✓ Returns 503 if not configured
  ✓ Returns 409 if already paid
  ✓ Subject truncation to 64 chars
  ✓ Price validation (> 0, finite)

- POST /api/webhooks/fomopay
  ✓ Verifies webhook signature
  ✓ Updates booking to paid/failed
  ✓ Returns 401 on bad signature
  ✓ Returns 400 on invalid JSON/fields
  ✓ Handles missing booking (should log, not 500)
```

### 6.3 End-to-End Scenarios (Manual Testing Recommended)

1. **Happy Path:**
   - Create booking → confirmation page → click "Pay" → redirect to FomoPay → complete payment → webhook arrives → booking status updated

2. **Duplicate Init:**
   - Click "Pay" twice quickly → should resume existing order (409 handling)

3. **Webhook Race:**
   - Complete payment → redirect to return page while webhook pending → polling refreshes and catches paid status

4. **Configuration Missing:**
   - Remove `FOMO_PAY_MID` env var → confirmation page shows "not configured" message

5. **Failed Payment:**
   - Complete payment but close browser before return → webhook marks as failed

6. **Invalid Signature:**
   - Send webhook with tampered body → verify 401 response

---

## 7. SIGN-OFF READINESS MATRIX

| Component | Status | Readiness | Notes |
|-----------|--------|-----------|-------|
| **Config** | ✅ | 95% | Robust, missing: rate limiting |
| **Auth** | ✅ | 90% | Solid, missing: credential masking in logs |
| **Types** | ✅ | 100% | Complete |
| **API Client** | ⚠️ | 75% | No timeouts, limited retries |
| **Webhook Verification** | ✅ | 95% | Excellent, missing: host validation |
| **Payment Initiation** | ⚠️ | 80% | Missing: idempotency keys, logging |
| **Webhook Handler** | ⚠️ | 75% | Silent failures, missing: logging |
| **Component** | ✅ | 90% | Good UX, missing: rate limit button |
| **Return Page** | ✅ | 85% | Good, missing: cache headers |
| **DB Schema** | ✅ | 95% | Safe migration |
| **Testing** | ❌ | 0% | **CRITICAL: No tests** |
| **Documentation** | ⚠️ | 40% | Only code comments, no runbook |

---

## 8. BLOCKERS FOR PRODUCTION SIGN-OFF

### 🛑 Must Have (Pre-GA):

1. **Test Suite** - Unit + integration tests (Jest/Vitest recommended)
   - Time estimate: 20-30 hours
   
2. **Structured Logging** - Replace `console.error()` with structured logs
   - Time estimate: 4-6 hours

3. **Error Documentation** - Runbook for common failure scenarios
   - Time estimate: 2-3 hours

4. **Request Timeouts** - Add `AbortSignal` timeout (5-15s) to fetch calls
   - Time estimate: 1-2 hours

### 🟡 Should Have (For Robustness):

5. **Idempotency Keys** - On hosted order creation
6. **Rate Limiting** - On payment button (debounce)
7. **Webhook Origin Validation** - IP allowlist or custom token
8. **Concurrency Locking** - DB-level on booking payment_status updates

---

## 9. QUICK REFERENCE: KEY FILES

| File | Purpose | LOC | Risk |
|------|---------|-----|------|
| [config.ts](src/lib/fomopay/config.ts) | Environment setup | ~20 | Low |
| [auth.ts](src/lib/fomopay/auth.ts) | Basic Auth | ~8 | Low |
| [types.ts](src/lib/fomopay/types.ts) | Type defs | ~25 | Low |
| [client.ts](src/lib/fomopay/client.ts) | HTTP + API logic | ~280 | Medium |
| [webhook.ts](src/lib/fomopay/webhook.ts) | Signature verification | ~110 | Low |
| [start/route.ts](src/app/api/payments/fomopay/start/route.ts) | Payment init | ~120 | Medium |
| [webhooks/route.ts](src/app/api/webhooks/fomopay/route.ts) | Webhook handler | ~70 | Medium |
| [FomoPayButton.tsx](src/components/booking/FomoPayButton.tsx) | UI Component | ~90 | Low |

**Total FomoPay-Specific Code:** ~700 LOC

---

## 10. RECOMMENDATIONS FOR NEXT STEPS

### Immediate (Week 1):
- [ ] Add `console.time()` for payment API latency monitoring
- [ ] Create `.env.example` with FomoPay variables documented
- [ ] Add error boundary around FomoPayButton

### Short-term (Week 2-3):
- [ ] Set up Jest + testing utilities
- [ ] Write webhook verification tests
- [ ] Write payment initiation tests

### Medium-term (Month 1):
- [ ] Add request timeouts
- [ ] Implement structured logging (Winston/Pino)
- [ ] Add rate limiting to payment endpoints
- [ ] Create operational runbook

### Long-term (Future):
- [ ] Add observability/tracing (OpenTelemetry)
- [ ] Implement webhook replay mechanism
- [ ] Add admin panel for manual order status checks
- [ ] Support refunds via API

---

**Generated:** April 4, 2026  
**Codebase Status:** Feature-complete, testing-required for production
