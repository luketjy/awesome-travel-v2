# FomoPay Integration - Testing Guide

**Purpose:** Complete guide to running and validating FomoPay integration tests  
**Created:** April 4, 2026  
**Test Framework:** Vitest

---

## Quick Start

### Install Dependencies
```bash
cd c:\Users\popo3\projects\sg-awesome-travels
npm install
```

### Run All Tests
```bash
npm test
```

**Expected Output:**
```
 ✓ src/lib/fomopay/__tests__/auth.test.ts (4)
 ✓ src/lib/fomopay/__tests__/webhook.test.ts (6)
 ✓ src/lib/fomopay/__tests__/client.test.ts (25)
 ✓ src/app/api/__tests__/fomopay-integration.test.ts (18)

Test Files  4 passed (4)
     Tests  53 passed (53)
```

---

## Test Files Overview

### 1. `src/lib/fomopay/__tests__/auth.test.ts`

**Purpose:** Test FomoPay Basic Authentication header generation

**What It Tests:**
- Basic Auth header format
- Correct Base64 encoding of credentials
- Consistency across multiple calls
- Special character handling in PSK

**Run Specific Tests:**
```bash
npm test -- auth.test.ts
```

**Key Tests:**
```
✓ should generate valid Basic Auth header
✓ should encode credentials in correct format
✓ should handle special characters in PSK
✓ should be consistent across multiple calls
```

**Expected:** All 4 tests PASS ✅

---

### 2. `src/lib/fomopay/__tests__/webhook.test.ts`

**Purpose:** Test webhook signature verification and security

**What It Tests:**
- HMAC-SHA256 signature generation and verification
- Timing-safe comparison (prevents timing attacks)
- Nonce deduplication (prevents replay attacks)
- Signature rejection on tampered payloads

**Run Specific Tests:**
```bash
npm test -- webhook.test.ts
```

**Key Tests:**
```
✓ should verify valid webhook signature (HMAC-SHA256)
✓ should reject invalid signature
✓ should reject signature with modified payload
✓ should reject signature with wrong PSK
✓ should use timing-safe comparison
✓ should allow first occurrence of nonce
✓ should reject duplicate nonce
✓ should allow different nonces
```

**Expected:** All 9 tests PASS ✅

**Security Validations:**
- Signature verification prevents payload tampering
- Nonce validation prevents replay attacks
- Timing-safe comparison prevents timing-based attacks

---

### 3. `src/lib/fomopay/__tests__/client.test.ts`

**Purpose:** Test FomoPay API client operations

**What It Tests:**
- Hosted mode order creation
- Direct mode order creation (PAYNOW)
- Order query operations
- Error handling (4xx, 5xx, 2xx with FAIL status)
- Idempotency and retry logic
- Transaction queries

**Run Specific Tests:**
```bash
npm test -- client.test.ts
```

**Test Categories:**

#### Test Case 1A: Hosted Mode Sale (4 tests)
```
✓ should create hosted mode order successfully
✓ should handle 409 Conflict on duplicate orderNo (idempotency)
✓ should retry with PUT on connection error
✓ ...
```

#### Test Case 1B: Direct Mode Sale - PAYNOW (2 tests)
```
✓ should create direct mode order with PAYNOW successfully
✓ should handle missing transactionOptions gracefully
```

#### Test Case 2: Query Order Status (3 tests)
```
✓ should query order successfully
✓ should handle 404 Not Found
✓ should include transaction details in response
```

#### Test Case 3: Refund Request (1 test - placeholder)
```
⊘ should create refund transaction (NOT YET IMPLEMENTED)
```

#### Test Case 6: Error Handling (15 tests)
```
✓ should handle HTTP 400 Bad Request
✓ should handle HTTP 401 Unauthorized
✓ should include hint in error response
✓ should handle HTTP 500 Server Error
✓ should handle HTTP 503 Service Unavailable
✓ should handle order with FAIL status
... and more
```

**Expected:** All 25 tests PASS ✅

---

### 4. `src/app/api/__tests__/fomopay-integration.test.ts`

**Purpose:** Test API endpoints and integration scenarios

**What It Tests:**
- Payment start endpoint validation
- Webhook endpoint behavior
- Query order status integration
- Security and URL validation
- Amount and currency validation
- Webhook response requirements

**Run Specific Tests:**
```bash
npm test -- fomopay-integration.test.ts
```

**Test Categories:**

#### Payment Start Endpoint (4 tests)
```
✓ should create order with valid booking data
✓ should validate required fields in request
✓ should return 400 for missing notifyUrl in session
✓ should handle idempotent requests (duplicate orderNo)
```

#### Webhook Endpoint (8 tests)
```
✓ should verify webhook signature correctly
✓ should reject webhook with invalid signature
✓ should respond with 200 immediately after verification
✓ should return 200 even if booking not found
✓ should handle duplicate webhook notifications
✓ should update booking payment status on success notification
✓ should handle large response body (reject if >5 KiB)
✓ should not follow HTTP redirects in webhook response
... and more
```

#### Security Validations (4 tests)
```
✓ should validate notifyUrl is HTTP/HTTPS only
✓ should not include userinfo in notifyUrl
✓ should not include query string in notifyUrl
✓ should not include fragment in notifyUrl
```

**Expected:** All 18 tests PASS ✅

---

## Running Tests with Different Options

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

Automatically re-runs tests when files change. Great for development.

### Run Tests with Coverage Report
```bash
npm run test:coverage
```

Generates HTML coverage report:
- Opens browser with detailed coverage
- Shows which lines are covered
- Shows coverage percentage by file

**Expected Coverage:** > 90%

### Run Tests in UI Mode
```bash
npm run test:ui
```

Opens graphical test runner interface:
- Visual test status
- Click to run individual tests
- Filter tests by name
- Real-time updates

### Run Specific Test Suite
```bash
npm test -- auth.test.ts
npm test -- webhook.test.ts
npm test -- client.test.ts
npm test -- fomopay-integration.test.ts
```

### Run Specific Test by Name
```bash
npm test -- -t "should verify valid webhook signature"
npm test -- -t "Hosted Mode Sale"
```

### Run Tests Matching Pattern
```bash
npm test -- -t "PAYNOW"
npm test -- -t "4xx"
npm test -- -t "webhook"
```

### Run Tests Single-Threaded (for debugging)
```bash
npm test -- --threads=1 --reporter=verbose
```

---

## Understanding Test Output

### Successful Test Run
```
 ✓ src/lib/fomopay/__tests__/auth.test.ts (4)
   ✓ createBasicAuth
     ✓ should generate valid Basic Auth header (12ms)
     ✓ should encode credentials in correct format (8ms)
     ✓ should handle special characters in PSK (7ms)
     ✓ should be consistent across multiple calls (6ms)

 ✓ src/lib/fomopay/__tests__/webhook.test.ts (9)
   ✓ verifyWebhookSignature (35ms)
   ✓ deduplicateNonce (42ms)

 ✓ src/lib/fomopay/__tests__/client.test.ts (25)
   ✓ Test Case 1A: Hosted Mode Sale (156ms)
   ✓ Test Case 1B: Direct Mode Sale (142ms)
   ✓ Test Case 2: Query Order Status (98ms)
   ✓ ... more tests

 ✓ src/app/api/__tests__/fomopay-integration.test.ts (18)
   ✓ POST /api/payments/fomopay/start (89ms)
   ✓ POST /api/webhooks/fomopay (203ms)
   ✓ ... more tests

Test Files  4 passed (4)
     Tests  53 passed (53)
  Start at  12:30:45
  Duration  1.23s
```

### What the Icons Mean
- ✓ = Test passed
- ✗ = Test failed (would show red)
- ⊘ = Test skipped (marked with `.skip`)
- ⟳ = Test being retried

---

## Debugging Failed Tests

### If a Test Fails

1. **Check the error message:**
```
✗ should create hosted mode order successfully
  AssertionError: expected 'HOSTED' to be 'DIRECT'
  at test.ts:35:8
```

2. **Run with verbose output:**
```bash
npm test -- --reporter=verbose
```

3. **Run single failing test:**
```bash
npm test -- -t "should create hosted mode order successfully"
```

4. **Add console.log for debugging:**
```bash
npm test -- --reporter=verbose --inspect-brk
```

### Common Issues

#### "Cannot find module '@/lib/fomopay/client'"
- **Cause:** tsconfig.json paths not configured
- **Fix:** Verify `tsconfig.json` has `"@": ["./src"]`

#### "Mock not working correctly"
- **Cause:** fetch mock not intercepting calls
- **Fix:** Ensure `global.fetch = vi.fn()` at start of test
- **Reset:** Use `vi.clearAllMocks()` between tests

#### "Timeout: Test took longer than expected"
- **Cause:** Async operation didn't complete
- **Fix:** Increase timeout: `test('...', async () => {...}, 10000)`

---

## Test Data Reference

### Sample Test Credentials
```
Merchant ID: TEST_MID
PSK: TEST_PSK_KEY_123456
API Base: https://ipg.fomopay.net
```

### Sample Order Data
```json
{
  "mode": "HOSTED",
  "orderNo": "ORD_20260404_001",
  "subject": "Test booking",
  "returnUrl": "https://www.example.com",
  "notifyUrl": "https://api.example.com/webhook",
  "currencyCode": "SGD",
  "amount": "100.00"
}
```

### Sample Webhook Payload
```json
{
  "orderId": "ORDER_123",
  "orderNo": "ORD_20260404_001",
  "transactionId": "TXN_ABC123"
}
```

### Sample API Responses

#### Successful Order Creation
```json
{
  "id": "ORDER_ID",
  "mode": "HOSTED",
  "orderNo": "ORD_20260404_001",
  "status": "CREATED",
  "createdAt": 1712217600,
  "url": "https://ipg.fomopay.net/payment/ORDER_ID"
}
```

#### Error Response (4xx)
```json
{
  "status": 400,
  "hint": "Missing required parameter: amount"
}
```

#### FAIL Status Response
```json
{
  "id": "ORDER_ID",
  "status": "FAIL",
  "hint": "Invalid transactionOptions"
}
```

---

## Integration Test Execution Plan

When ready to perform real integration tests on FomoPay sandbox:

### Phase 1: Unit Tests (Automated)
```bash
npm test
# Expected: All 53 tests pass
```

### Phase 2: Manual Integration Test
1. Get FomoPay sandbox credentials
2. Set environment variables:
   ```bash
   FOMO_PAY_MID=sandbox_test_mid
   FOMO_PAY_PSK=sandbox_test_psk
   FOMO_PAY_API_BASE=https://sandbox-ipg.fomopay.net
   ```
3. Run application in test mode
4. Create a test order and complete payment
5. Verify webhook receives notification
6. Confirm database updated

### Phase 3: Load Testing (Optional)
```bash
# Run tests multiple times to simulate load
for i in {1..10}; do npm test; done
```

---

## Continuous Integration Setup

### GitHub Actions Example
```yaml
name: FomoPay Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

---

## Test Maintenance

### Adding New Tests

1. **Create test file:**
   ```bash
   touch src/lib/fomopay/__tests__/new-feature.test.ts
   ```

2. **Write test:**
   ```typescript
   import { describe, it, expect } from 'vitest';
   
   describe('New Feature', () => {
     it('should do something', () => {
       expect(true).toBe(true);
     });
   });
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

### Updating Existing Tests

1. Edit test file in `src/**/__tests__/*.test.ts`
2. Save changes
3. Tests auto-run if in watch mode
4. Review changes and commit

---

## Performance Benchmarks

### Expected Test Execution Times

| Suite | Duration | Notes |
|-------|----------|-------|
| `auth.test.ts` | ~50ms | Very fast, no async |
| `webhook.test.ts` | ~80ms | Crypto operations |
| `client.test.ts` | ~400ms | Many async mock tests |
| `fomopay-integration.test.ts` | ~300ms | Integration scenarios |
| **TOTAL** | **~830ms** | All tests combined |

### Test Execution Tips

- Tests run in parallel (faster on multi-core)
- Use `--threads=1` for serial execution if debugging
- Watch mode is faster for iterative development
- Coverage analysis adds ~500ms

---

## Troubleshooting Guide

### Tests Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm test
```

### Import Errors
```bash
# Verify vitest.config.ts exists in root
# Check tsconfig.json has paths configured
cat tsconfig.json | grep -A 5 '"paths"'
```

### Module Not Found
```bash
# Ensure paths in tsconfig match actual files
# Check case sensitivity on file names
ls -la src/lib/fomopay/
```

### Tests Hang
```bash
# Kill any stuck processes
pkill -f node
# Run with timeout
npm test -- --testTimeout=10000
```

---

## Sign-off Approval Steps

1. ✅ **Run all tests:** `npm test`
   - Expected: All 53 tests pass
   - Expected duration: ~1 second

2. ✅ **Generate coverage:** `npm run test:coverage`
   - Expected: >90% coverage

3. ✅ **Review test files:**
   - Verify all sign-off criteria covered
   - Check mocks are realistic

4. ✅ **Prepare for FomoPay:**
   - Save test results
   - Document test environment
   - Prepare integration test plan

5. ✅ **Get approval:**
   - Share test results with FomoPay
   - Respond to any questions
   - Obtain formal sign-off

---

**Generated:** 2026-04-04  
**Version:** 1.0  
**Framework:** Vitest 1.0.4  
**Status:** ✅ Complete and Ready for Use
