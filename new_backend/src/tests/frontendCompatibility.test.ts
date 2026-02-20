/**
 * Frontend Compatibility Tests
 * 
 * Verifies that the frontend can work with the integrated backend without code changes.
 * Tests Requirement 10.4 - Frontend compatibility
 */

import request from 'supertest';
import express from 'express';
import authRoutes from '../routes/authRoutes';
import chatRoutes from '../routes/chatRoutes';
import healthRoutes from '../routes/healthRoutes';
import cors from 'cors';

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

describe('Frontend Compatibility', () => {
  let app: express.Application;

  beforeAll(async () => {
    // Create test app that mimics the integrated backend
    app = express();
    
    // CORS configuration (as frontend expects)
    app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
      credentials: true
    }));
    
    app.use(express.json());
    
    // Register existing routes
    app.use('/api/health', healthRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/chat', chatRoutes);
  });

  describe('CORS Configuration', () => {
    it('should allow requests from frontend origin', async () => {
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:5173');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should support preflight requests', async () => {
      const response = await request(app)
        .options('/api/auth/login')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'POST');

      expect(response.status).toBe(204);
    });
  });

  describe('Frontend API Endpoints', () => {
    it('should support frontend authentication flow', async () => {
      // Test registration
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Frontend Test User',
          email: `frontend${Date.now()}@example.com`,
          password: 'Test123!',
          gender: 'female',
        });

      expect(registerResponse.body).toHaveProperty('success');
      
      // Test login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Test123!',
        });

      expect(loginResponse.body).toHaveProperty('success');
    });

    it('should support frontend chat flow', async () => {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: 'test-user-id' },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '1h' }
      );

      // Test sending message
      const messageResponse = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: 'I feel great today',
          inputType: 'text',
        });

      expect(messageResponse.body).toHaveProperty('success');
      
      // Test getting session
      const sessionResponse = await request(app)
        .get('/api/chat/session')
        .set('Authorization', `Bearer ${token}`);

      expect(sessionResponse.status).toBe(200);
      expect(sessionResponse.body).toHaveProperty('success');
      
      // Test ending session
      const endSessionResponse = await request(app)
        .post('/api/chat/end-session')
        .set('Authorization', `Bearer ${token}`);

      expect(endSessionResponse.status).toBe(200);
      expect(endSessionResponse.body).toHaveProperty('success');
    });

    it('should support health check endpoint', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
    });
  });

  describe('Response Format Consistency', () => {
    it('should return JSON responses for all API endpoints', async () => {
      // Test GET endpoint
      const getResponse = await request(app)
        .get('/api/health');
      expect(getResponse.headers['content-type']).toMatch(/application\/json/);

      // Test POST endpoint
      const postResponse = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'Test123!' });
      expect(postResponse.headers['content-type']).toMatch(/application\/json/);
    });

    it('should maintain consistent success/error response structure', async () => {
      // Success response structure
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: 'test-user-id' },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '1h' }
      );

      const successResponse = await request(app)
        .get('/api/chat/session')
        .set('Authorization', `Bearer ${token}`);

      expect(successResponse.body).toHaveProperty('success');
      if (successResponse.body.success) {
        expect(successResponse.body).toHaveProperty('data');
      }

      // Error response structure
      const errorResponse = await request(app)
        .post('/api/chat/message')
        .send({ message: 'Hello' });

      expect(errorResponse.body).toHaveProperty('success');
      expect(errorResponse.body.success).toBe(false);
      expect(errorResponse.body.message || errorResponse.body.errors).toBeDefined();
    });
  });

  describe('Authentication Token Handling', () => {
    it('should accept Bearer token in Authorization header', async () => {
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
    });

    it('should reject requests without authentication token', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .send({
          message: 'Hello',
          inputType: 'text',
        });

      expect(response.status).toBe(401);
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/chat/session')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('Request Body Validation', () => {
    it('should validate required fields in registration', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          // Missing full_name and password
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate required fields in login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          // Missing password
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate required fields in chat message', async () => {
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
          // Missing message
          inputType: 'text',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('HTTP Status Codes', () => {
    it('should return appropriate status codes for different scenarios', async () => {
      // 200 for successful GET
      const healthResponse = await request(app).get('/api/health');
      expect(healthResponse.status).toBe(200);

      // 401 for unauthorized
      const unauthorizedResponse = await request(app)
        .post('/api/chat/message')
        .send({ message: 'Hello' });
      expect(unauthorizedResponse.status).toBe(401);

      // 400 for validation errors
      const validationResponse = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid-email' });
      expect(validationResponse.status).toBe(400);
    });
  });

  describe('Frontend Integration Points', () => {
    it('should support all frontend API calls without modification', () => {
      // Verify that all expected routes are registered
      const routes = [
        '/api/health',
        '/api/auth',
        '/api/chat',
      ];

      routes.forEach(route => {
        expect(app._router.stack.some((layer: any) => 
          layer.regexp && layer.regexp.test(route)
        )).toBe(true);
      });
    });

    it('should maintain backward compatible error messages', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'WrongPassword123!',
        });

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });
  });

  describe('No Breaking Changes', () => {
    it('should not require frontend code changes for existing features', async () => {
      // Test that all existing API contracts are maintained
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: 'test-user-id' },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '1h' }
      );

      // Chat message endpoint
      const chatResponse = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: 'Test message',
          inputType: 'text',
        });

      expect(chatResponse.body).toHaveProperty('success');
      if (chatResponse.body.success) {
        expect(chatResponse.body.data).toHaveProperty('reply');
        expect(chatResponse.body.data).toHaveProperty('emotion');
        expect(chatResponse.body.data).toHaveProperty('meta');
      }

      // Session endpoint
      const sessionResponse = await request(app)
        .get('/api/chat/session')
        .set('Authorization', `Bearer ${token}`);

      expect(sessionResponse.body).toHaveProperty('success');
      expect(sessionResponse.body).toHaveProperty('data');
    });
  });
});
