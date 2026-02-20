/**
 * Jest Setup File
 * Configure mocks and environment for all tests
 */

// Set test environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing_only';
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
