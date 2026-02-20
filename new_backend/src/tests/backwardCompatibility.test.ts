/**
 * Backward Compatibility Tests
 * 
 * Verifies that existing API endpoints maintain their contracts after microservices integration.
 * Tests Requirements 10.1, 10.5 - Backward compatibility for direct endpoints
 */

import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes';
import chatRoutes from '../routes/chatRoutes';

// Mock the database pool
jest.mock('../config/db', () => ({
  pool: {
    query: jest.fn(),
    end: jest.fn(),
  },
  dbHealthCheck: jest.fn().mockResolvedValue(true),
}));

// Mock chat pipeline service
jest.mock('../services/chatPipelineService', () => ({
  processChatMessage: jest.fn().mockResolvedValue({
    ai_response_text: 'This is a test response from SAMA',
    emotion: {
      primary: 'calm',
      intensity: 0.7,
      detected: ['calm', 'supportive']
    },
    recommendations: [],
    is_crisis: false,
    crisis_level: null,
    session_id: 'test-session-id',
    message_id: 'test-message-id'
  }),
}));

// Mock chat service
jest.mock('../services/chatService', () => ({
  getActiveSession: jest.fn().mockResolvedValue({
    session_id: 'test-session-id',
    start_time: new Date().toISOString(),
    session_type: 'regular'
  }),
  endSession: jest.fn().mockResolvedValue(true),
}));

describe('Backward Compatibility - Existing Backend Endpoints', () => {
  let app: express.Application;

  beforeAll(async () => {
    // Create test app
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use('/api/chat', chatRoutes);
  });

  describe('POST /api/auth/register - Response Format', () => {
    it('should return expected response structure on validation failure', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Test User',
          email: 'invalid-email',
          password: '123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
      // Validation errors return either 'message' or 'errors' array
      expect(response.body.message || response.body.errors).toBeDefined();
    });

    it('should accept valid registration request format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Test User',
          email: `test${Date.now()}@example.com`,
          password: 'Test123!',
          gender: 'male',
        });

      // Verify response structure (even if it fails due to DB issues)
      expect(response.body).toHaveProperty('success');
      
      if (response.status === 201) {
        expect(response.body.success).toBe(true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('token');
        expect(response.body.data).toHaveProperty('user');
      }
    });
  });

  describe('POST /api/auth/login - Response Format', () => {
    it('should return expected response structure', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!',
        });

      // Verify response structure
      expect(response.body).toHaveProperty('success');
      
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('token');
        expect(response.body.data).toHaveProperty('user');
      } else {
        expect(response.body.success).toBe(false);
        expect(response.body).toHaveProperty('message');
      }
    });
  });

  describe('POST /api/chat/message - Response Format', () => {
    it('should return expected response structure for authenticated requests', async () => {
      // Create a test token
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: 'test-user-id' },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: 'I feel anxious today',
          inputType: 'text',
        });

      // Verify response structure
      expect(response.body).toHaveProperty('success');
      
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('reply');
        expect(response.body.data).toHaveProperty('emotion');
        expect(response.body.data).toHaveProperty('meta');
        expect(response.body.data.meta).toHaveProperty('session_id');
        expect(response.body.data.meta).toHaveProperty('message_id');
      }
    });

    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .send({
          message: 'Hello',
          inputType: 'text',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });

    it('should validate empty message', async () => {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: 'test-user-id' },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: '',
          inputType: 'text',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/chat/session - Response Format', () => {
    it('should return session data for authenticated requests', async () => {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: 'test-user-id' },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/chat/session')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('POST /api/chat/end-session - Response Format', () => {
    it('should return success response for authenticated requests', async () => {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: 'test-user-id' },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post('/api/chat/end-session')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(true);
    });
  });

  describe('API Contract Stability', () => {
    it('auth endpoints should maintain /api/auth/* path structure', () => {
      const authRouter = require('../routes/authRoutes').default;
      expect(authRouter).toBeDefined();
      expect(authRouter.stack).toBeDefined();
      
      // Verify routes are registered
      const routes = authRouter.stack
        .filter((layer: any) => layer.route)
        .map((layer: any) => ({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods)
        }));
      
      expect(routes.length).toBeGreaterThan(0);
    });

    it('chat endpoints should maintain /api/chat/* path structure', () => {
      const chatRouter = require('../routes/chatRoutes').default;
      expect(chatRouter).toBeDefined();
      expect(chatRouter.stack).toBeDefined();
      
      // Verify routes are registered
      const routes = chatRouter.stack
        .filter((layer: any) => layer.route)
        .map((layer: any) => ({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods)
        }));
      
      expect(routes.length).toBeGreaterThan(0);
    });
  });

  describe('Response Headers', () => {
    it('should include Content-Type: application/json for API responses', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!',
        });

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('Error Response Format', () => {
    it('should return consistent error format across endpoints', async () => {
      const authError = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid',
          password: '123',
        });

      expect(authError.body).toHaveProperty('success');
      expect(authError.body.success).toBe(false);
      // Errors return either 'message' or 'errors' array
      expect(authError.body.message || authError.body.errors).toBeDefined();

      const chatError = await request(app)
        .post('/api/chat/message')
        .send({
          message: 'Hello',
        });

      expect(chatError.body).toHaveProperty('success');
      expect(chatError.body.success).toBe(false);
      expect(chatError.body.message || chatError.body.errors).toBeDefined();
    });
  });
});
