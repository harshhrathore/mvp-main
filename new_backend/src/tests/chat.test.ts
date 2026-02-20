// Chat API Tests
// NOTE: These tests require a running PostgreSQL database and are currently skipped
// TODO: Convert to use in-memory database setup


import request from 'supertest';
import app from '../index';
import { pool } from '../config/db';

describe.skip('Chat API', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Register a test user
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        full_name: 'Chat Test User',
        email: `chat${Date.now()}@example.com`,
        password: 'Test123!',
      });

    authToken = response.body.data.token;
    userId = response.body.data.user.id;
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('POST /api/chat/message', () => {
    it('should send a text message and get AI response', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'I feel anxious today',
          inputType: 'text',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reply).toBeDefined();
      expect(response.body.data.emotion).toBeDefined();
      expect(response.body.data.emotion.primary).toBeDefined();
    });

    it('should detect crisis keywords', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'I feel hopeless and want to end it all',
          inputType: 'text',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.is_crisis).toBe(true);
      expect(response.body.data.reply).toContain('helpline');
    });

    it('should reject request without auth token', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .send({
          message: 'Hello',
          inputType: 'text',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject empty message', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: '',
          inputType: 'text',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/chat/session', () => {
    it('should return current session', async () => {
      // First send a message to create a session
      await request(app)
        .post('/api/chat/message')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'Hello',
          inputType: 'text',
        });

      const response = await request(app)
        .get('/api/chat/session')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('POST /api/chat/end-session', () => {
    it('should end current session', async () => {
      const response = await request(app)
        .post('/api/chat/end-session')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});