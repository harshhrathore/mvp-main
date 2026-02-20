import request from 'supertest';
import express from 'express';
import * as fc from 'fast-check';
import healthRoutes from '../routes/healthRoutes';

// Mock the database health check
jest.mock('../config/db', () => ({
  dbHealthCheck: jest.fn(),
}));

// Mock axios for service health checks
jest.mock('axios');

import { dbHealthCheck } from '../config/db';
import axios from 'axios';

const mockedDbHealthCheck = dbHealthCheck as jest.MockedFunction<typeof dbHealthCheck>;
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Property-Based Tests: Health Check Database Verification', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use('/health', healthRoutes);
    jest.clearAllMocks();
  });

  /**
   * Property 8: Health Check Database Verification
   * **Validates: Requirements 3.4**
   * 
   * For any service health check request, the service SHALL verify database 
   * connectivity and return "unhealthy" status if the database is unreachable.
   */
  it('Property 8: should return unhealthy status when database is unreachable', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary downstream service configurations
        fc.record({
          hasCheckinChat: fc.boolean(),
          hasCheckinVoice: fc.boolean(),
          checkinChatAvailable: fc.boolean(),
          checkinVoiceAvailable: fc.boolean(),
        }),
        async (serviceConfig) => {
          // Setup: Database is disconnected
          mockedDbHealthCheck.mockResolvedValue(false);

          // Setup downstream services based on generated config
          if (serviceConfig.hasCheckinChat) {
            process.env.CHECKIN_CHAT_URL = 'http://localhost:8000';
          } else {
            delete process.env.CHECKIN_CHAT_URL;
          }

          if (serviceConfig.hasCheckinVoice) {
            process.env.CHECKIN_VOICE_URL = 'http://localhost:8001';
          } else {
            delete process.env.CHECKIN_VOICE_URL;
          }

          // Mock axios to return appropriate responses based on URL
          mockedAxios.get = jest.fn().mockImplementation((url: string) => {
            if (url.includes('8000')) {
              return serviceConfig.checkinChatAvailable
                ? Promise.resolve({ status: 200 })
                : Promise.reject(new Error('Service unavailable'));
            }
            if (url.includes('8001')) {
              return serviceConfig.checkinVoiceAvailable
                ? Promise.resolve({ status: 200 })
                : Promise.reject(new Error('Service unavailable'));
            }
            return Promise.resolve({ status: 200 });
          });

          // Execute: Make health check request
          const response = await request(app).get('/health');

          // Verify: Status must be unhealthy when database is disconnected
          expect(response.body.status).toBe('unhealthy');
          expect(response.status).toBe(503);
          expect(response.body.checks.database).toBe('disconnected');

          // Cleanup
          delete process.env.CHECKIN_CHAT_URL;
          delete process.env.CHECKIN_VOICE_URL;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8 (Inverse): Health Check Database Verification
   * **Validates: Requirements 3.4**
   * 
   * For any service health check request, when the database IS reachable,
   * the service SHALL verify database connectivity and return status that is NOT "unhealthy"
   * (either "healthy" or "degraded" depending on downstream services).
   */
  it('Property 8 (Inverse): should NOT return unhealthy status when database is connected', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary downstream service configurations
        fc.record({
          hasCheckinChat: fc.boolean(),
          hasCheckinVoice: fc.boolean(),
          checkinChatAvailable: fc.boolean(),
          checkinVoiceAvailable: fc.boolean(),
        }),
        async (serviceConfig) => {
          // Setup: Database is connected
          mockedDbHealthCheck.mockResolvedValue(true);

          // Setup downstream services based on generated config
          let anyServiceUnavailable = false;

          if (serviceConfig.hasCheckinChat) {
            process.env.CHECKIN_CHAT_URL = 'http://localhost:8000';
            if (!serviceConfig.checkinChatAvailable) {
              anyServiceUnavailable = true;
            }
          } else {
            delete process.env.CHECKIN_CHAT_URL;
          }

          if (serviceConfig.hasCheckinVoice) {
            process.env.CHECKIN_VOICE_URL = 'http://localhost:8001';
            if (!serviceConfig.checkinVoiceAvailable) {
              anyServiceUnavailable = true;
            }
          } else {
            delete process.env.CHECKIN_VOICE_URL;
          }

          // Mock axios to return appropriate responses based on URL
          mockedAxios.get = jest.fn().mockImplementation((url: string) => {
            if (url.includes('8000')) {
              return serviceConfig.checkinChatAvailable
                ? Promise.resolve({ status: 200 })
                : Promise.reject(new Error('Service unavailable'));
            }
            if (url.includes('8001')) {
              return serviceConfig.checkinVoiceAvailable
                ? Promise.resolve({ status: 200 })
                : Promise.reject(new Error('Service unavailable'));
            }
            return Promise.resolve({ status: 200 });
          });

          // Execute: Make health check request
          const response = await request(app).get('/health');

          // Verify: Status must NOT be unhealthy when database is connected
          expect(response.body.status).not.toBe('unhealthy');
          expect(response.status).toBe(200);
          expect(response.body.checks.database).toBe('connected');

          // Additional verification: status should be degraded if any service is unavailable
          if (anyServiceUnavailable) {
            expect(response.body.status).toBe('degraded');
          } else {
            expect(response.body.status).toBe('healthy');
          }

          // Cleanup
          delete process.env.CHECKIN_CHAT_URL;
          delete process.env.CHECKIN_VOICE_URL;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8 (Database Check Execution): Health Check Database Verification
   * **Validates: Requirements 3.4**
   * 
   * For any service health check request, the service SHALL always call
   * the database health check function to verify connectivity.
   */
  it('Property 8 (Database Check Execution): should always verify database connectivity', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary database states and service configurations
        fc.record({
          dbConnected: fc.boolean(),
          hasCheckinChat: fc.boolean(),
          hasCheckinVoice: fc.boolean(),
        }),
        async (config) => {
          // Setup: Configure database state
          mockedDbHealthCheck.mockResolvedValue(config.dbConnected);

          // Setup downstream services
          if (config.hasCheckinChat) {
            process.env.CHECKIN_CHAT_URL = 'http://localhost:8000';
            mockedAxios.get = jest.fn().mockResolvedValue({ status: 200 });
          } else {
            delete process.env.CHECKIN_CHAT_URL;
          }

          if (config.hasCheckinVoice) {
            process.env.CHECKIN_VOICE_URL = 'http://localhost:8001';
            mockedAxios.get = jest.fn().mockResolvedValue({ status: 200 });
          } else {
            delete process.env.CHECKIN_VOICE_URL;
          }

          // Execute: Make health check request
          await request(app).get('/health');

          // Verify: Database health check function must have been called
          expect(mockedDbHealthCheck).toHaveBeenCalled();

          // Cleanup
          delete process.env.CHECKIN_CHAT_URL;
          delete process.env.CHECKIN_VOICE_URL;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property-Based Tests: Health Check Response Format', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use('/health', healthRoutes);
    jest.clearAllMocks();
  });

  /**
   * Property 9: Health Check Response Format
   * **Validates: Requirements 3.5**
   * 
   * For any health check response, the JSON SHALL contain fields: 
   * status, timestamp, service, version, and checks.
   */
  it('Property 9: should always return response with required fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary system states
        fc.record({
          dbConnected: fc.boolean(),
          hasCheckinChat: fc.boolean(),
          hasCheckinVoice: fc.boolean(),
          checkinChatAvailable: fc.boolean(),
          checkinVoiceAvailable: fc.boolean(),
        }),
        async (config) => {
          // Setup: Configure database state
          mockedDbHealthCheck.mockResolvedValue(config.dbConnected);

          // Setup downstream services based on generated config
          if (config.hasCheckinChat) {
            process.env.CHECKIN_CHAT_URL = 'http://localhost:8000';
          } else {
            delete process.env.CHECKIN_CHAT_URL;
          }

          if (config.hasCheckinVoice) {
            process.env.CHECKIN_VOICE_URL = 'http://localhost:8001';
          } else {
            delete process.env.CHECKIN_VOICE_URL;
          }

          // Mock axios to return appropriate responses
          mockedAxios.get = jest.fn().mockImplementation((url: string) => {
            if (url.includes('8000')) {
              return config.checkinChatAvailable
                ? Promise.resolve({ status: 200 })
                : Promise.reject(new Error('Service unavailable'));
            }
            if (url.includes('8001')) {
              return config.checkinVoiceAvailable
                ? Promise.resolve({ status: 200 })
                : Promise.reject(new Error('Service unavailable'));
            }
            return Promise.resolve({ status: 200 });
          });

          // Execute: Make health check request
          const response = await request(app).get('/health');

          // Verify: Response must contain all required fields
          expect(response.body).toHaveProperty('status');
          expect(response.body).toHaveProperty('timestamp');
          expect(response.body).toHaveProperty('service');
          expect(response.body).toHaveProperty('version');
          expect(response.body).toHaveProperty('checks');

          // Verify: status field must be one of the valid values
          expect(['healthy', 'degraded', 'unhealthy']).toContain(response.body.status);

          // Verify: timestamp must be a valid ISO 8601 string
          expect(() => new Date(response.body.timestamp)).not.toThrow();
          expect(new Date(response.body.timestamp).toISOString()).toBe(response.body.timestamp);

          // Verify: service must be a non-empty string
          expect(typeof response.body.service).toBe('string');
          expect(response.body.service.length).toBeGreaterThan(0);

          // Verify: version must be a non-empty string
          expect(typeof response.body.version).toBe('string');
          expect(response.body.version.length).toBeGreaterThan(0);

          // Verify: checks must be an object
          expect(typeof response.body.checks).toBe('object');
          expect(response.body.checks).not.toBeNull();

          // Verify: checks.database must exist and be valid
          expect(response.body.checks).toHaveProperty('database');
          expect(['connected', 'disconnected']).toContain(response.body.checks.database);

          // Verify: if dependencies exist, they must be properly formatted
          if (response.body.checks.dependencies) {
            expect(typeof response.body.checks.dependencies).toBe('object');
            Object.values(response.body.checks.dependencies).forEach((value) => {
              expect(['available', 'unavailable']).toContain(value);
            });
          }

          // Cleanup
          delete process.env.CHECKIN_CHAT_URL;
          delete process.env.CHECKIN_VOICE_URL;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9 (Field Types): Health Check Response Format
   * **Validates: Requirements 3.5**
   * 
   * For any health check response, all fields must have the correct types
   * and valid values according to the specification.
   */
  it('Property 9 (Field Types): should return fields with correct types and valid values', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary system states
        fc.record({
          dbConnected: fc.boolean(),
          hasCheckinChat: fc.boolean(),
          hasCheckinVoice: fc.boolean(),
          checkinChatAvailable: fc.boolean(),
          checkinVoiceAvailable: fc.boolean(),
        }),
        async (config) => {
          // Setup: Configure database state
          mockedDbHealthCheck.mockResolvedValue(config.dbConnected);

          // Setup downstream services
          if (config.hasCheckinChat) {
            process.env.CHECKIN_CHAT_URL = 'http://localhost:8000';
          } else {
            delete process.env.CHECKIN_CHAT_URL;
          }

          if (config.hasCheckinVoice) {
            process.env.CHECKIN_VOICE_URL = 'http://localhost:8001';
          } else {
            delete process.env.CHECKIN_VOICE_URL;
          }

          // Mock axios
          mockedAxios.get = jest.fn().mockImplementation((url: string) => {
            if (url.includes('8000')) {
              return config.checkinChatAvailable
                ? Promise.resolve({ status: 200 })
                : Promise.reject(new Error('Service unavailable'));
            }
            if (url.includes('8001')) {
              return config.checkinVoiceAvailable
                ? Promise.resolve({ status: 200 })
                : Promise.reject(new Error('Service unavailable'));
            }
            return Promise.resolve({ status: 200 });
          });

          // Execute: Make health check request
          const response = await request(app).get('/health');
          const body = response.body;

          // Verify: status must be exactly one of the three valid values
          const validStatuses = ['healthy', 'degraded', 'unhealthy'];
          expect(validStatuses).toContain(body.status);
          expect(typeof body.status).toBe('string');

          // Verify: timestamp must be a valid ISO 8601 formatted string
          expect(typeof body.timestamp).toBe('string');
          const parsedDate = new Date(body.timestamp);
          expect(parsedDate.toString()).not.toBe('Invalid Date');
          expect(parsedDate.toISOString()).toBe(body.timestamp);

          // Verify: service must be a string
          expect(typeof body.service).toBe('string');

          // Verify: version must be a string
          expect(typeof body.version).toBe('string');

          // Verify: checks must be an object with database field
          expect(typeof body.checks).toBe('object');
          expect(body.checks).not.toBeNull();
          expect(['connected', 'disconnected']).toContain(body.checks.database);

          // Cleanup
          delete process.env.CHECKIN_CHAT_URL;
          delete process.env.CHECKIN_VOICE_URL;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9 (Consistency): Health Check Response Format
   * **Validates: Requirements 3.5**
   * 
   * For any health check response, the status field must be consistent
   * with the checks field (e.g., unhealthy when database is disconnected).
   */
  it('Property 9 (Consistency): should have consistent status and checks fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary system states
        fc.record({
          dbConnected: fc.boolean(),
          hasCheckinChat: fc.boolean(),
          hasCheckinVoice: fc.boolean(),
          checkinChatAvailable: fc.boolean(),
          checkinVoiceAvailable: fc.boolean(),
        }),
        async (config) => {
          // Setup: Configure database state
          mockedDbHealthCheck.mockResolvedValue(config.dbConnected);

          // Setup downstream services
          if (config.hasCheckinChat) {
            process.env.CHECKIN_CHAT_URL = 'http://localhost:8000';
          } else {
            delete process.env.CHECKIN_CHAT_URL;
          }

          if (config.hasCheckinVoice) {
            process.env.CHECKIN_VOICE_URL = 'http://localhost:8001';
          } else {
            delete process.env.CHECKIN_VOICE_URL;
          }

          // Mock axios
          mockedAxios.get = jest.fn().mockImplementation((url: string) => {
            if (url.includes('8000')) {
              return config.checkinChatAvailable
                ? Promise.resolve({ status: 200 })
                : Promise.reject(new Error('Service unavailable'));
            }
            if (url.includes('8001')) {
              return config.checkinVoiceAvailable
                ? Promise.resolve({ status: 200 })
                : Promise.reject(new Error('Service unavailable'));
            }
            return Promise.resolve({ status: 200 });
          });

          // Execute: Make health check request
          const response = await request(app).get('/health');
          const body = response.body;

          // Verify: Consistency rules
          // Rule 1: If database is disconnected, status must be unhealthy
          if (body.checks.database === 'disconnected') {
            expect(body.status).toBe('unhealthy');
          }

          // Rule 2: If database is connected and any dependency is unavailable, status must be degraded
          if (body.checks.database === 'connected' && body.checks.dependencies) {
            const hasUnavailableService = Object.values(body.checks.dependencies).some(
              (s) => s === 'unavailable'
            );
            if (hasUnavailableService) {
              expect(body.status).toBe('degraded');
            }
          }

          // Rule 3: If database is connected and all dependencies are available (or no dependencies), status must be healthy
          if (body.checks.database === 'connected') {
            const allServicesAvailable = !body.checks.dependencies || 
              Object.values(body.checks.dependencies).every((s) => s === 'available');
            if (allServicesAvailable) {
              expect(body.status).toBe('healthy');
            }
          }

          // Cleanup
          delete process.env.CHECKIN_CHAT_URL;
          delete process.env.CHECKIN_VOICE_URL;
        }
      ),
      { numRuns: 100 }
    );
  });
});
