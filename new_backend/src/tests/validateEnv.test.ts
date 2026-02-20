/**
 * Tests for environment variable validation
 * 
 * Requirements: 4.6 - Validate required environment variables before starting services
 */

import { validateRequiredEnv, ensureValidEnv } from '../config/validateEnv';

describe('Environment Variable Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('validateRequiredEnv', () => {
    it('should pass validation when all required variables are set', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
      process.env.JWT_SECRET = 'a'.repeat(32);
      process.env.CHECKIN_CHAT_URL = 'http://localhost:8000';
      process.env.CHECKIN_VOICE_URL = 'http://localhost:8001';

      const result = validateRequiredEnv();

      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation when DATABASE_URL is missing', () => {
      delete process.env.DATABASE_URL;
      process.env.JWT_SECRET = 'a'.repeat(32);
      process.env.CHECKIN_CHAT_URL = 'http://localhost:8000';
      process.env.CHECKIN_VOICE_URL = 'http://localhost:8001';

      const result = validateRequiredEnv();

      expect(result.valid).toBe(false);
      expect(result.missing).toContain('DATABASE_URL');
      expect(result.errors.some(e => e.includes('DATABASE_URL'))).toBe(true);
    });

    it('should fail validation when JWT_SECRET is missing', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
      delete process.env.JWT_SECRET;
      process.env.CHECKIN_CHAT_URL = 'http://localhost:8000';
      process.env.CHECKIN_VOICE_URL = 'http://localhost:8001';

      const result = validateRequiredEnv();

      expect(result.valid).toBe(false);
      expect(result.missing).toContain('JWT_SECRET');
    });

    it('should fail validation when CHECKIN_CHAT_URL is missing', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
      process.env.JWT_SECRET = 'a'.repeat(32);
      delete process.env.CHECKIN_CHAT_URL;
      process.env.CHECKIN_VOICE_URL = 'http://localhost:8001';

      const result = validateRequiredEnv();

      expect(result.valid).toBe(false);
      expect(result.missing).toContain('CHECKIN_CHAT_URL');
    });

    it('should fail validation when CHECKIN_VOICE_URL is missing', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
      process.env.JWT_SECRET = 'a'.repeat(32);
      process.env.CHECKIN_CHAT_URL = 'http://localhost:8000';
      delete process.env.CHECKIN_VOICE_URL;

      const result = validateRequiredEnv();

      expect(result.valid).toBe(false);
      expect(result.missing).toContain('CHECKIN_VOICE_URL');
    });

    it('should fail validation when DATABASE_URL has invalid format', () => {
      process.env.DATABASE_URL = 'invalid-url';
      process.env.JWT_SECRET = 'a'.repeat(32);
      process.env.CHECKIN_CHAT_URL = 'http://localhost:8000';
      process.env.CHECKIN_VOICE_URL = 'http://localhost:8001';

      const result = validateRequiredEnv();

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('DATABASE_URL') && e.includes('invalid'))).toBe(true);
    });

    it('should fail validation when JWT_SECRET is too short', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
      process.env.JWT_SECRET = 'short';
      process.env.CHECKIN_CHAT_URL = 'http://localhost:8000';
      process.env.CHECKIN_VOICE_URL = 'http://localhost:8001';

      const result = validateRequiredEnv();

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('JWT_SECRET') && e.includes('invalid'))).toBe(true);
    });

    it('should fail validation when service URLs have invalid format', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
      process.env.JWT_SECRET = 'a'.repeat(32);
      process.env.CHECKIN_CHAT_URL = 'not-a-url';
      process.env.CHECKIN_VOICE_URL = 'http://localhost:8001';

      const result = validateRequiredEnv();

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('CHECKIN_CHAT_URL') && e.includes('invalid'))).toBe(true);
    });

    it('should report multiple missing variables', () => {
      delete process.env.DATABASE_URL;
      delete process.env.JWT_SECRET;
      delete process.env.CHECKIN_CHAT_URL;
      delete process.env.CHECKIN_VOICE_URL;

      const result = validateRequiredEnv();

      expect(result.valid).toBe(false);
      expect(result.missing.length).toBeGreaterThanOrEqual(4);
      expect(result.missing).toContain('DATABASE_URL');
      expect(result.missing).toContain('JWT_SECRET');
      expect(result.missing).toContain('CHECKIN_CHAT_URL');
      expect(result.missing).toContain('CHECKIN_VOICE_URL');
    });
  });

  describe('ensureValidEnv', () => {
    it('should not throw when all required variables are valid', () => {
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
      process.env.JWT_SECRET = 'a'.repeat(32);
      process.env.CHECKIN_CHAT_URL = 'http://localhost:8000';
      process.env.CHECKIN_VOICE_URL = 'http://localhost:8001';

      expect(() => ensureValidEnv()).not.toThrow();
    });

    it('should throw with clear error message when variables are missing', () => {
      delete process.env.DATABASE_URL;
      delete process.env.JWT_SECRET;

      expect(() => ensureValidEnv()).toThrow(/ENVIRONMENT CONFIGURATION ERROR/);
      expect(() => ensureValidEnv()).toThrow(/DATABASE_URL/);
      expect(() => ensureValidEnv()).toThrow(/JWT_SECRET/);
    });

    it('should throw with instructions on how to fix missing variables', () => {
      delete process.env.DATABASE_URL;

      expect(() => ensureValidEnv()).toThrow(/Copy .env.example to .env/);
      expect(() => ensureValidEnv()).toThrow(/Fill in all required values/);
    });
  });

  describe('Custom configuration', () => {
    it('should validate custom required variables', () => {
      const customConfig = {
        required: ['CUSTOM_VAR_1', 'CUSTOM_VAR_2'],
      };

      delete process.env.CUSTOM_VAR_1;
      delete process.env.CUSTOM_VAR_2;

      const result = validateRequiredEnv(customConfig);

      expect(result.valid).toBe(false);
      expect(result.missing).toContain('CUSTOM_VAR_1');
      expect(result.missing).toContain('CUSTOM_VAR_2');
    });

    it('should pass validation when custom variables are set', () => {
      const customConfig = {
        required: ['CUSTOM_VAR_1', 'CUSTOM_VAR_2'],
      };

      process.env.CUSTOM_VAR_1 = 'value1';
      process.env.CUSTOM_VAR_2 = 'value2';

      const result = validateRequiredEnv(customConfig);

      expect(result.valid).toBe(true);
      expect(result.missing).toHaveLength(0);
    });
  });
});
