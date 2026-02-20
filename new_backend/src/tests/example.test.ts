/**
 * Example Test File
 * 
 * This file demonstrates the usage of the testing infrastructure and utilities.
 * It can be used as a reference for writing property-based tests and unit tests.
 */

import * as fc from 'fast-check';
import {
  messageArbitrary,
  emotionArbitrary,
  doshaProfileArbitrary,
  userPreferencesArbitrary,
  chatResponseArbitrary,
  sessionIdArbitrary
} from './generators';
import {
  setupTestEnvironment,
  createTestDatabase,
  initializeTestSchema
} from './dbSetup';
import {
  generateTestToken,
  assertChatResponseStructure,
  createMockChatResponse
} from './testUtilities';

describe('Testing Infrastructure Examples', () => {
  describe('Property-Based Testing with fast-check', () => {
    // Feature: sama-chat-integration, Property Example: Message Generation
    test('messageArbitrary generates valid messages', () => {
      fc.assert(
        fc.property(messageArbitrary, (message) => {
          expect(typeof message).toBe('string');
          expect(message.length).toBeGreaterThan(0);
          expect(message.length).toBeLessThanOrEqual(2000);
        }),
        { numRuns: 100 }
      );
    });

    // Feature: sama-chat-integration, Property Example: Emotion Structure
    test('emotionArbitrary generates valid emotion objects', () => {
      fc.assert(
        fc.property(emotionArbitrary, (emotion) => {
          expect(emotion).toHaveProperty('primary');
          expect(emotion).toHaveProperty('intensity');
          expect(typeof emotion.primary).toBe('string');
          expect(typeof emotion.intensity).toBe('number');
          expect(emotion.intensity).toBeGreaterThanOrEqual(0);
          expect(emotion.intensity).toBeLessThanOrEqual(1);
        }),
        { numRuns: 100 }
      );
    });

    // Feature: sama-chat-integration, Property Example: Dosha Profile
    test('doshaProfileArbitrary generates valid dosha profiles', () => {
      fc.assert(
        fc.property(doshaProfileArbitrary, (profile) => {
          expect(profile).toHaveProperty('primary_dosha');
          expect(profile).toHaveProperty('prakriti_scores');
          expect(['VATA', 'PITTA', 'KAPHA']).toContain(profile.primary_dosha);
          expect(profile.prakriti_scores).toHaveProperty('VATA');
          expect(profile.prakriti_scores).toHaveProperty('PITTA');
          expect(profile.prakriti_scores).toHaveProperty('KAPHA');
        }),
        { numRuns: 100 }
      );
    });

    // Feature: sama-chat-integration, Property Example: User Preferences
    test('userPreferencesArbitrary generates valid preferences', () => {
      fc.assert(
        fc.property(userPreferencesArbitrary, (prefs) => {
          expect(prefs).toHaveProperty('emotional_attachment');
          expect(prefs).toHaveProperty('preferred_language');
          expect(prefs.emotional_attachment).toBeGreaterThanOrEqual(1);
          expect(prefs.emotional_attachment).toBeLessThanOrEqual(10);
          
          if (prefs.voice_gender !== null) {
            expect(['male', 'female']).toContain(prefs.voice_gender);
          }
        }),
        { numRuns: 100 }
      );
    });

    // Feature: sama-chat-integration, Property Example: Chat Response Structure
    test('chatResponseArbitrary generates valid response structure', () => {
      fc.assert(
        fc.property(chatResponseArbitrary, (response) => {
          assertChatResponseStructure(response);
          expect(Array.isArray(response.data.recommendations)).toBe(true);
          expect(typeof response.data.is_crisis).toBe('boolean');
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Database Testing with pg-mem', () => {
    test('can create in-memory database', async () => {
      const { db, pool } = createTestDatabase();
      expect(db).toBeDefined();
      expect(pool).toBeDefined();
    });

    test('can initialize schema', async () => {
      const { db, pool } = createTestDatabase();
      await initializeTestSchema(pool);
      
      // Verify tables exist by querying them
      const result = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      const tableNames = result.rows.map((row: any) => row.table_name);
      expect(tableNames).toContain('users');
      expect(tableNames).toContain('conversation_sessions');
      expect(tableNames).toContain('conversation_messages');
    });

    test('can setup complete test environment', async () => {
      const { pool, userId, sessionId, cleanup } = await setupTestEnvironment();
      
      expect(userId).toBeDefined();
      expect(sessionId).toBeDefined();
      
      // Verify user exists
      const userResult = await pool.query(
        'SELECT * FROM users WHERE user_id = $1',
        [userId]
      );
      expect(userResult.rows.length).toBe(1);
      
      // Verify session exists
      const sessionResult = await pool.query(
        'SELECT * FROM conversation_sessions WHERE session_id = $1',
        [sessionId]
      );
      expect(sessionResult.rows.length).toBe(1);
      
      await cleanup();
    });
  });

  describe('Test Utilities', () => {
    test('generateTestToken creates valid JWT', () => {
      fc.assert(
        fc.property(sessionIdArbitrary, (userId) => {
          const token = generateTestToken(userId);
          expect(typeof token).toBe('string');
          expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
        }),
        { numRuns: 50 }
      );
    });

    test('createMockChatResponse creates valid structure', () => {
      const response = createMockChatResponse();
      assertChatResponseStructure(response);
    });

    test('createMockChatResponse accepts overrides', () => {
      const response = createMockChatResponse(
        'Custom reply',
        { primary: 'joy', intensity: 0.8 },
        true
      );
      
      expect(response.data.reply).toBe('Custom reply');
      expect(response.data.emotion.primary).toBe('joy');
      expect(response.data.emotion.intensity).toBe(0.8);
      expect(response.data.is_crisis).toBe(true);
    });
  });
});
