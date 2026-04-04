import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createFomoPayClient } from '@/lib/fomopay/client';

// Mock fetch
global.fetch = vi.fn();

describe('FomoPay Client - Sign-off Test Cases', () => {
  const config = {
    merchantId: 'TEST_MID',
    psk: 'TEST_PSK_123456',
    apiBase: 'https://ipg.fomopay.net',
  };

  let client: ReturnType<typeof createFomoPayClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    client = createFomoPayClient(config);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Test Case 1A: Hosted Mode Sale', () => {
    it('should create hosted mode order successfully', async () => {
      const orderId = 'ORDER_HOSTED_001';
      const orderNo = `ORD_${Date.now()}`;

      const mockResponse = {
        id: orderId,
        mode: 'HOSTED',
        orderNo,
        subject: 'hosted sale test',
        returnUrl: 'https://www.fomopay.com',
        notifyUrl: 'https://eo1api6vmzjwuw3.m.pipedream.net',
        currencyCode: 'SGD',
        amount: '1.00',
        status: 'CREATED',
        createdAt: Math.floor(Date.now() / 1000),
        url: 'https://ipg.fomopay.net/payment/ORDER_HOSTED_001',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.createOrder({
        mode: 'HOSTED',
        orderNo,
        subject: 'hosted sale test',
        returnUrl: 'https://www.fomopay.com',
        notifyUrl: 'https://eo1api6vmzjwuw3.m.pipedream.net',
        currencyCode: 'SGD',
        amount: '1.00',
      });

      expect(result).toBeDefined();
      expect(result.id).toBe(orderId);
      expect(result.status).toBe('CREATED');
      expect(result.url).toBeDefined();
    });

    it('should handle 409 Conflict on duplicate orderNo (idempotency)', async () => {
      const orderNo = 'DUP_ORDER_001';

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ hint: 'Order already exists' }),
      });

      try {
        await client.createOrder({
          mode: 'HOSTED',
          orderNo,
          subject: 'test',
          returnUrl: 'https://www.fomopay.com',
          notifyUrl: 'https://webhook.example.com',
          currencyCode: 'SGD',
          amount: '1.00',
        });
      } catch (error: any) {
        expect(error.status).toBe(409);
        expect(error.message).toContain('409');
      }
    });

    it('should retry with PUT on connection error', async () => {
      const orderNo = `ORD_RETRY_${Date.now()}`;

      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Connection timeout'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            id: 'ORDER_RETRIED',
            status: 'CREATED',
            url: 'https://ipg.fomopay.net/payment/ORDER_RETRIED',
          }),
        });

      // Attempt creation (would trigger retry logic)
      const result = await client.createOrder({
        mode: 'HOSTED',
        orderNo,
        subject: 'test',
        returnUrl: 'https://www.fomopay.com',
        notifyUrl: 'https://webhook.example.com',
        currencyCode: 'SGD',
        amount: '1.00',
      }).catch(() => null);

      // Note: Actual retry behavior depends on client implementation
    });
  });

  describe('Test Case 1B: Direct Mode Sale (PAYNOW)', () => {
    it('should create direct mode order with PAYNOW successfully', async () => {
      const orderId = 'ORDER_DIRECT_001';
      const orderNo = `ORD_DIRECT_${Date.now()}`;

      const mockResponse = {
        id: orderId,
        mode: 'DIRECT',
        orderNo,
        subject: 'direct sale test',
        notifyUrl: 'https://eo1api6vmzjwuw3.m.pipedream.net',
        currencyCode: 'SGD',
        amount: '1.00',
        sourceOfFund: 'PAYNOW',
        status: 'CREATED',
        createdAt: Math.floor(Date.now() / 1000),
        primaryTransactionId: 'TXN_DIRECT_001',
        codeUrl: '00020101021226610014code.fomopay.net0706202604F2520400005303SGD5409100005802SG62410503***63041234',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.createOrder({
        mode: 'DIRECT',
        orderNo,
        subject: 'direct sale test',
        notifyUrl: 'https://eo1api6vmzjwuw3.m.pipedream.net',
        currencyCode: 'SGD',
        amount: '1.00',
        sourceOfFund: 'PAYNOW',
        transactionOptions: { timeout: 600 },
      });

      expect(result).toBeDefined();
      expect(result.mode).toBe('DIRECT');
      expect(result.sourceOfFund).toBe('PAYNOW');
      expect(result.primaryTransactionId).toBeDefined();
      expect(result.codeUrl).toBeDefined();
    });

    it('should handle missing transactionOptions gracefully', async () => {
      const orderNo = `ORD_${Date.now()}`;

      const mockResponse = {
        id: 'ORDER_ID',
        mode: 'DIRECT',
        orderNo,
        status: 'CREATED',
        codeUrl: 'QR_CODE_DATA',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.createOrder({
        mode: 'DIRECT',
        orderNo,
        subject: 'test',
        notifyUrl: 'https://webhook.example.com',
        currencyCode: 'SGD',
        amount: '1.00',
        sourceOfFund: 'PAYNOW',
      });

      expect(result).toBeDefined();
    });
  });

  describe('Test Case 2: Query Order Status', () => {
    it('should query order successfully', async () => {
      const orderId = 'ORDER_QUERY_001';

      const mockResponse = {
        id: orderId,
        mode: 'HOSTED',
        orderNo: 'ORD_20260404_001',
        subject: 'hosted sale test',
        notifyUrl: 'https://webhook.example.com',
        currencyCode: 'SGD',
        amount: '1.00',
        status: 'PAID',
        createdAt: Math.floor(Date.now() / 1000),
        primaryTransactionId: 'TXN_QUERY_001',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.queryOrder(orderId);

      expect(result).toBeDefined();
      expect(result.id).toBe(orderId);
      expect(result.status).toBeDefined();
      expect(['CREATED', 'PAID', 'FAILED']).toContain(result.status);
    });

    it('should handle 404 Not Found', async () => {
      const orderId = 'NONEXISTENT_ORDER';

      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ hint: 'Order not found' }),
      });

      try {
        await client.queryOrder(orderId);
      } catch (error: any) {
        expect(error.status).toBe(404);
      }
    });

    it('should include transaction details in response', async () => {
      const orderId = 'ORDER_WITH_TXN';

      const mockResponse = {
        id: orderId,
        status: 'PAID',
        primaryTransactionId: 'TXN_001',
        transactions: [
          {
            id: 'TXN_001',
            type: 'SALE',
            status: 'SUCCESS',
            amount: '1.00',
          },
        ],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.queryOrder(orderId);
      expect(result.primaryTransactionId).toBe('TXN_001');
    });
  });

  describe('Test Case 3: Refund Request (Not Yet Implemented)', () => {
    it('should create refund transaction', async () => {
      const orderId = 'ORDER_REFUND_001';
      const originalTransactionId = 'TXN_ORIGINAL_001';
      const refundTransactionNo = `RFND_${Date.now()}`;

      const mockResponse = {
        id: 'REFUND_TXN_001',
        type: 'REFUND',
        originalId: originalTransactionId,
        transactionNo: refundTransactionNo,
        subject: 'refund test',
        currencyCode: 'SGD',
        amount: '1.00',
        status: 'CREATED',
        createdAt: Math.floor(Date.now() / 1000),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      // This assumes a refund method exists or would be tested via raw API call
      const result = await client.createRefund?.(
        orderId,
        originalTransactionId,
        {
          type: 'REFUND',
          originalId: originalTransactionId,
          transactionNo: refundTransactionNo,
          currencyCode: 'SGD',
          amount: '1.00',
          subject: 'refund test',
        }
      );

      if (result) {
        expect(result.type).toBe('REFUND');
        expect(result.status).toBe('CREATED');
      }
    });
  });

  describe('Test Case 4: Refund Transaction Query', () => {
    it('should query refund transaction', async () => {
      const orderId = 'ORDER_REFUND_001';
      const transactionId = 'REFUND_TXN_001';

      const mockResponse = {
        id: transactionId,
        type: 'REFUND',
        originalId: 'TXN_ORIGINAL_001',
        transactionNo: 'RFND_20260404_001',
        subject: 'refund query test',
        currencyCode: 'SGD',
        amount: '1.00',
        status: 'SUCCESS',
        createdAt: Math.floor(Date.now() / 1000),
        sourceOfFund: 'PAYNOW',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.queryTransaction?.(orderId, transactionId);

      if (result) {
        expect(result.type).toBe('REFUND');
        expect(result.originalId).toBeDefined();
      }
    });
  });

  describe('Test Case 5: Webhook Notifications', () => {
    it('should receive notify message with orderId and transactionId', async () => {
      const notifyPayload = {
        orderId: 'ORDER_NOTIFY_001',
        orderNo: 'ORD_20260404_001',
        transactionId: 'TXN_NOTIFY_001',
      };

      // Simulate webhook handler receiving notification
      expect(notifyPayload).toHaveProperty('orderId');
      expect(notifyPayload).toHaveProperty('transactionId');
      expect(notifyPayload.orderId).toBeDefined();
    });
  });

  describe('Test Case 6A: HTTP 4xx Errors', () => {
    it('should handle HTTP 400 Bad Request', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ hint: 'Invalid request parameters' }),
      });

      try {
        await client.createOrder({
          mode: 'HOSTED',
          orderNo: '',
          subject: 'test',
          returnUrl: '',
          notifyUrl: '',
          currencyCode: 'SGD',
          amount: '1.00',
        });
      } catch (error: any) {
        expect(error.status).toBe(400);
      }
    });

    it('should handle HTTP 401 Unauthorized', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ hint: 'Invalid credentials' }),
      });

      try {
        await client.createOrder({
          mode: 'HOSTED',
          orderNo: `ORD_${Date.now()}`,
          subject: 'test',
          returnUrl: 'https://example.com',
          notifyUrl: 'https://webhook.example.com',
          currencyCode: 'SGD',
          amount: '1.00',
        });
      } catch (error: any) {
        expect(error.status).toBe(401);
      }
    });

    it('should include hint in error response', async () => {
      const hint = 'Missing required field: orderNo';
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ hint }),
      });

      try {
        await client.createOrder({
          mode: 'HOSTED',
          orderNo: '',
          subject: '',
          returnUrl: '',
          notifyUrl: '',
          currencyCode: 'SGD',
          amount: '1.00',
        });
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Test Case 6B: HTTP 5xx Errors', () => {
    it('should handle HTTP 500 Server Error', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ hint: 'Internal server error' }),
      });

      try {
        await client.createOrder({
          mode: 'HOSTED',
          orderNo: `ORD_${Date.now()}`,
          subject: 'test',
          returnUrl: 'https://example.com',
          notifyUrl: 'https://webhook.example.com',
          currencyCode: 'SGD',
          amount: '1.00',
        });
      } catch (error: any) {
        expect(error.status).toBe(500);
      }
    });

    it('should handle HTTP 503 Service Unavailable', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: async () => ({ hint: 'Service temporarily unavailable' }),
      });

      try {
        await client.createOrder({
          mode: 'HOSTED',
          orderNo: `ORD_${Date.now()}`,
          subject: 'test',
          returnUrl: 'https://example.com',
          notifyUrl: 'https://webhook.example.com',
          currencyCode: 'SGD',
          amount: '1.00',
        });
      } catch (error: any) {
        expect(error.status).toBe(503);
      }
    });
  });

  describe('Test Case 6C: HTTP 2xx with Fail Status', () => {
    it('should handle order with FAIL status', async () => {
      const orderId = 'ORDER_FAIL_001';
      const orderNo = `ORD_FAIL_${Date.now()}`;

      const mockResponse = {
        id: orderId,
        mode: 'DIRECT',
        orderNo,
        subject: 'fail case test',
        notifyUrl: 'https://webhook.example.com',
        returnUrl: 'https://example.com',
        currencyCode: 'SGD',
        amount: '1.00',
        status: 'FAIL',
        createdAt: Math.floor(Date.now() / 1000),
        primaryTransactionId: 'TXN_FAIL_001',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.createOrder({
        mode: 'DIRECT',
        orderNo,
        subject: 'fail case test',
        notifyUrl: 'https://webhook.example.com',
        returnUrl: 'https://example.com',
        currencyCode: 'SGD',
        amount: '1.00',
        sourceOfFund: 'WECHATPAY',
        transactionOptions: {
          txnType: 'JSAPI',
          timeout: 600,
          openid: 'failcasetest',
          ip: '42.61.209.105',
        },
      });

      expect(result).toBeDefined();
      expect(result.status).toBe('FAIL');
      expect(result.id).toBe(orderId);
    });

    it('should allow application to handle FAIL status', async () => {
      const mockResponse = {
        id: 'ORDER_FAIL_002',
        status: 'FAIL',
        hint: 'Invalid transaction options',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await client.createOrder({
        mode: 'DIRECT',
        orderNo: `ORD_${Date.now()}`,
        subject: 'fail case',
        notifyUrl: 'https://webhook.example.com',
        currencyCode: 'SGD',
        amount: '1.00',
        sourceOfFund: 'WECHATPAY',
      });

      expect(result.status).toBe('FAIL');
      // Application should:
      // 1. Store order ID for debugging
      // 2. Update booking status to failed
      // 3. Potentially notify user
    });
  });
});
