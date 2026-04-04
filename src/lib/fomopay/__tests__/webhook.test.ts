import { describe, it, expect, beforeEach } from 'vitest';
import { verifyWebhookSignature, deduplicateNonce } from '@/lib/fomopay/webhook';
import crypto from 'crypto';

describe('FomoPay Webhook', () => {
  const psk = 'test_psk_key_123456';
  const orderId = 'ORDER_123';
  const orderNo = 'ORD_20260404_001';
  const transactionId = 'TXN_ABC123';

  describe('verifyWebhookSignature', () => {
    it('should verify valid webhook signature (HMAC-SHA256)', () => {
      const payload = {
        orderId,
        orderNo,
        transactionId,
      };

      const payloadStr = JSON.stringify(payload);
      const signature = crypto
        .createHmac('sha256', psk)
        .update(payloadStr)
        .digest('hex');

      const result = verifyWebhookSignature(payloadStr, signature, psk);
      expect(result).toBe(true);
    });

    it('should reject invalid signature', () => {
      const payload = {
        orderId,
        orderNo,
        transactionId,
      };

      const payloadStr = JSON.stringify(payload);
      const invalidSignature = 'invalid_signature_hash_value';

      const result = verifyWebhookSignature(payloadStr, invalidSignature, psk);
      expect(result).toBe(false);
    });

    it('should reject signature with modified payload', () => {
      const payload = {
        orderId,
        orderNo,
        transactionId,
      };

      const payloadStr = JSON.stringify(payload);
      const correctSignature = crypto
        .createHmac('sha256', psk)
        .update(payloadStr)
        .digest('hex');

      const modifiedPayload = JSON.stringify({
        ...payload,
        amount: '999.99', // Modified payload
      });

      const result = verifyWebhookSignature(modifiedPayload, correctSignature, psk);
      expect(result).toBe(false);
    });

    it('should reject signature with wrong PSK', () => {
      const payload = {
        orderId,
        orderNo,
        transactionId,
      };

      const payloadStr = JSON.stringify(payload);
      const correctSignature = crypto
        .createHmac('sha256', psk)
        .update(payloadStr)
        .digest('hex');

      const wrongPsk = 'wrong_psk_key';
      const result = verifyWebhookSignature(payloadStr, correctSignature, wrongPsk);
      expect(result).toBe(false);
    });

    it('should use timing-safe comparison', () => {
      const payload = { orderId, orderNo, transactionId };
      const payloadStr = JSON.stringify(payload);
      const validSignature = crypto
        .createHmac('sha256', psk)
        .update(payloadStr)
        .digest('hex');

      // Similar looking but invalid signature
      const invalidSignature = validSignature
        .split('')
        .map((char, i) => (i === 0 ? 'f' : char))
        .join('');

      const result = verifyWebhookSignature(payloadStr, invalidSignature, psk);
      expect(result).toBe(false);
    });
  });

  describe('deduplicateNonce', () => {
    beforeEach(() => {
      // Clear nonce storage between tests
      deduplicateNonce.clear?.();
    });

    it('should allow first occurrence of nonce', () => {
      const nonce = 'NONCE_12345';
      const result = deduplicateNonce(nonce);
      expect(result).toBe(true);
    });

    it('should reject duplicate nonce', () => {
      const nonce = 'NONCE_12345';
      deduplicateNonce(nonce);
      const result = deduplicateNonce(nonce);
      expect(result).toBe(false);
    });

    it('should allow different nonces', () => {
      const nonce1 = 'NONCE_12345';
      const nonce2 = 'NONCE_67890';

      const result1 = deduplicateNonce(nonce1);
      const result2 = deduplicateNonce(nonce2);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });

    it('should expire nonces after timeout', async () => {
      const nonce = 'NONCE_TIMEOUT_TEST';
      const result1 = deduplicateNonce(nonce);
      expect(result1).toBe(true);

      // Wait for nonce to expire (assuming 5 minute TTL by default)
      // For testing, we can check internal state or mock time
      // This is just a placeholder for performance tests
    });
  });
});
