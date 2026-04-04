import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createBasicAuth } from '@/lib/fomopay/auth';

describe('FomoPay Auth', () => {
  const merchantId = 'TEST_MID';
  const psk = 'TEST_PSK_KEY_123456';

  describe('createBasicAuth', () => {
    it('should generate valid Basic Auth header', () => {
      const header = createBasicAuth(merchantId, psk);
      expect(header).toBeDefined();
      expect(header).toMatch(/^Basic /);
    });

    it('should encode credentials in correct format', () => {
      const header = createBasicAuth(merchantId, psk);
      const base64Part = header.replace('Basic ', '');
      const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');
      expect(decoded).toBe(`${merchantId}:${psk}`);
    });

    it('should handle special characters in PSK', () => {
      const specialPsk = 'PSK+/=Special!@#$%';
      const header = createBasicAuth(merchantId, specialPsk);
      expect(header).toMatchObject(/^Basic /);
      
      const base64Part = header.replace('Basic ', '');
      const decoded = Buffer.from(base64Part, 'base64').toString('utf-8');
      expect(decoded).toContain(merchantId);
    });

    it('should be consistent across multiple calls', () => {
      const header1 = createBasicAuth(merchantId, psk);
      const header2 = createBasicAuth(merchantId, psk);
      expect(header1).toBe(header2);
    });
  });
});
