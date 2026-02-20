// Auth API Tests


import request from 'supertest';
import app from '../index';
import { pool } from '../config/db';

describe('Auth API', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Test User',
          email: `test${Date.now()}@example.com`,
          password: 'Test123!',
          gender: 'male',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      const email = `duplicate${Date.now()}@example.com`;
      
      await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'First User',
          email,
          password: 'Test123!',
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Second User',
          email,
          password: 'Test123!',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Test User',
          email: 'test@example.com',
          password: '123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    const testUser = {
      email: `login${Date.now()}@example.com`,
      password: 'Test123!',
    };

    beforeAll(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          full_name: 'Login Test User',
          email: testUser.email,
          password: testUser.password,
        });
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Test123!',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});