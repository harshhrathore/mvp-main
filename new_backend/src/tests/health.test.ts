import request from 'supertest';
import express from 'express';
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

describe('Health Endpoint', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use('/health', healthRoutes);
    jest.clearAllMocks();
  });

  it('should return healthy status when database is connected and no downstream services configured', async () => {
    mockedDbHealthCheck.mockResolvedValue(true);
    
    // Temporarily unset service URLs to simulate no downstream services configured
    const originalCheckinChatUrl = process.env.CHECKIN_CHAT_URL;
    const originalCheckinVoiceUrl = process.env.CHECKIN_VOICE_URL;
    delete process.env.CHECKIN_CHAT_URL;
    delete process.env.CHECKIN_VOICE_URL;

    const response = await request(app).get('/health');
    
    // Restore environment variables
    process.env.CHECKIN_CHAT_URL = originalCheckinChatUrl;
    process.env.CHECKIN_VOICE_URL = originalCheckinVoiceUrl;

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'healthy',
      service: 'api-gateway',
      version: '1.0.0',
      checks: {
        database: 'connected',
      },
    });
    expect(response.body.timestamp).toBeDefined();
  });

  it('should return unhealthy status when database is disconnected', async () => {
    mockedDbHealthCheck.mockResolvedValue(false);

    const response = await request(app).get('/health');

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      status: 'unhealthy',
      service: 'api-gateway',
      version: '1.0.0',
      checks: {
        database: 'disconnected',
      },
    });
  });

  it('should return degraded status when database is connected but downstream service is unavailable', async () => {
    mockedDbHealthCheck.mockResolvedValue(true);
    process.env.CHECKIN_CHAT_URL = 'http://localhost:8000';
    
    mockedAxios.get = jest.fn().mockRejectedValue(new Error('Service unavailable'));

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'degraded',
      service: 'api-gateway',
      version: '1.0.0',
      checks: {
        database: 'connected',
        dependencies: {
          'checkin-chat': 'unavailable',
        },
      },
    });

    delete process.env.CHECKIN_CHAT_URL;
  });

  it('should return healthy status when database and all downstream services are available', async () => {
    mockedDbHealthCheck.mockResolvedValue(true);
    process.env.CHECKIN_CHAT_URL = 'http://localhost:8000';
    process.env.CHECKIN_VOICE_URL = 'http://localhost:8001';
    
    mockedAxios.get = jest.fn().mockResolvedValue({ status: 200 });

    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'healthy',
      service: 'api-gateway',
      version: '1.0.0',
      checks: {
        database: 'connected',
        dependencies: {
          'checkin-chat': 'available',
          'checkin-voice': 'available',
        },
      },
    });

    delete process.env.CHECKIN_CHAT_URL;
    delete process.env.CHECKIN_VOICE_URL;
  });

  it('should include timestamp in ISO 8601 format', async () => {
    mockedDbHealthCheck.mockResolvedValue(true);

    const response = await request(app).get('/health');

    expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });

  it('should handle errors gracefully', async () => {
    mockedDbHealthCheck.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/health');

    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({
      status: 'unhealthy',
      service: 'api-gateway',
      version: '1.0.0',
      checks: {
        database: 'disconnected',
      },
    });
  });
});
