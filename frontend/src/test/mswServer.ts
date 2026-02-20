/**
 * Mock Service Worker (MSW) Server Setup
 * 
 * This module sets up MSW for testing API calls in Node.js environment.
 */

import { setupServer } from 'msw/node';
import { defaultHandlers } from './mswHandlers';

/**
 * Create MSW server with default handlers
 */
export const server = setupServer(...defaultHandlers);

/**
 * Setup MSW server for tests
 */
export function setupMSW() {
  // Start server before all tests
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' });
  });

  // Reset handlers after each test
  afterEach(() => {
    server.resetHandlers();
  });

  // Clean up after all tests
  afterAll(() => {
    server.close();
  });
}
