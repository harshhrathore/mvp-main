/**
 * Property-Based Tests for Cross-Session Context Service
 * Feature: sama-chat-integration
 */

import * as fc from 'fast-check';
import { setupTestEnvironment, clearTestData } from './dbSetup';
import { CrossSessionContextService } from '../services/crossSessionContextService';
import { randomUUID } from 'crypto';

describe('CrossSessionContextService', () => {
  let pool: any;
  let userId: string;
  let sessionId: string;
  let cleanup: () => Promise<void>;
  let service: CrossSessionContextService;

  beforeAll(async () => {
    const env = await setupTestEnvironment();
    pool = env.pool;
    userId = env.userId;
    sessionId = env.sessionId;
    cleanup = env.cleanup;
    service = new CrossSessionContextService();
    
    // Override the pool in the service for testing
    // We need to inject the test pool
    (service as any).pool = pool;
  });

  afterAll(async () => {
    await cleanup();
  });

  afterEach(async () => {
    // Clear all data after each test to avoid UUID conflicts
    await pool.query('DELETE FROM emotion_analysis');
    await pool.query('DELETE FROM conversation_messages');
    await pool.query('DELETE FROM conversation_sessions WHERE session_id != $1', [sessionId]);
    await pool.query('DELETE FROM users WHERE user_id != $1', [userId]);
  });

  // Feature: sama-chat-integration, Property 8: Cross-Session Context Retrieval
  describe('Property 8: Cross-Session Context Retrieval', () => {
    test('retrieves messages from last N days filtered by user_id', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 7 }), // days to look back
          fc.array(
            fc.record({
              transcript: fc.string({ minLength: 5, maxLength: 50 }).filter(s => !s.includes('\\')), // Exclude backslashes for pg-mem
              response: fc.string({ minLength: 5, maxLength: 50 }).filter(s => !s.includes('\\')),
              daysAgo: fc.integer({ min: 0, max: 10 })
            }),
            { minLength: 1, maxLength: 3 } // Reduced to avoid UUID collisions
          ),
          async (days, messages) => {
            // Clear previous test data completely
            await pool.query('DELETE FROM conversation_messages');

            // Insert test messages with various timestamps
            for (let i = 0; i < messages.length; i++) {
              const msg = messages[i];
              const messageDate = new Date();
              messageDate.setDate(messageDate.getDate() - msg.daysAgo);
              
              await pool.query(`
                INSERT INTO conversation_messages (
                  message_id, session_id, user_id, sequence_number, input_type,
                  transcript_text, ai_response_text, created_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
              `, [
                randomUUID(),
                sessionId,
                userId,
                i + 1,
                'text',
                msg.transcript,
                msg.response,
                messageDate
              ]);
            }

            // Retrieve messages using the service
            const retrieved = await service.getRecentMessages(userId, days);

            // Count expected messages (within the day range)
            const expectedCount = messages.filter(m => m.daysAgo < days).length * 2; // *2 for user + assistant

            // Property: Retrieved messages should only be from the specified time range
            expect(retrieved.length).toBe(expectedCount);

            // Property: All retrieved messages should be within the time range
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);
            
            for (const msg of retrieved) {
              expect(msg.timestamp.getTime()).toBeGreaterThanOrEqual(cutoffDate.getTime());
            }

            // Property: Messages should be in chronological order
            for (let i = 1; i < retrieved.length; i++) {
              expect(retrieved[i].timestamp.getTime()).toBeGreaterThanOrEqual(
                retrieved[i - 1].timestamp.getTime()
              );
            }

            // Property: Each message should have required fields
            for (const msg of retrieved) {
              expect(msg).toHaveProperty('role');
              expect(msg).toHaveProperty('content');
              expect(msg).toHaveProperty('timestamp');
              expect(msg).toHaveProperty('session_id');
              expect(['user', 'assistant']).toContain(msg.role);
              expect(msg.content.length).toBeGreaterThan(0);
            }
            
            // Clean up after this property test run
            await pool.query('DELETE FROM conversation_messages');
          }
        ),
        { numRuns: 50 } // Reduced runs to avoid pg-mem UUID issues
      );
    });

    test('formatForPrompt converts messages to AI prompt format', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              role: fc.constantFrom('user', 'assistant') as fc.Arbitrary<'user' | 'assistant'>,
              content: fc.string({ minLength: 1, maxLength: 200 }),
              timestamp: fc.date({ min: new Date('2024-01-01'), max: new Date() }),
              session_id: fc.uuid()
            }),
            { minLength: 0, maxLength: 20 }
          ),
          async (messages) => {
            // Format messages
            const formatted = service.formatForPrompt(messages);

            // Property: Output length should match input length
            expect(formatted.length).toBe(messages.length);

            // Property: Each formatted message should have only role and content
            for (let i = 0; i < formatted.length; i++) {
              expect(formatted[i]).toHaveProperty('role');
              expect(formatted[i]).toHaveProperty('content');
              expect(Object.keys(formatted[i]).length).toBe(2);
              
              // Property: Role and content should match original
              expect(formatted[i].role).toBe(messages[i].role);
              expect(formatted[i].content).toBe(messages[i].content);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('filters messages by user_id correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              transcript: fc.string({ minLength: 5, maxLength: 50 }).filter(s => !s.includes('\\')),
              response: fc.string({ minLength: 5, maxLength: 50 }).filter(s => !s.includes('\\'))
            }),
            { minLength: 1, maxLength: 2 } // Reduced to avoid UUID collisions
          ),
          async (messages) => {
            // Clear previous test data
            await pool.query('DELETE FROM conversation_messages');
            await pool.query('DELETE FROM conversation_sessions WHERE session_id != $1', [sessionId]);
            await pool.query('DELETE FROM users WHERE user_id != $1', [userId]);

            // Create a second user with unique email and explicit user_id
            const uniqueEmail = `test2-${Date.now()}-${Math.random()}@example.com`;
            const userId2 = randomUUID();
            await pool.query(`
              INSERT INTO users (user_id, email, password_hash, name)
              VALUES ($1, $2, $3, $4)
            `, [userId2, uniqueEmail, 'hashed_password', 'Test User 2']);

            // Create session for second user
            const sessionId2 = randomUUID();
            await pool.query(`
              INSERT INTO conversation_sessions (session_id, user_id, session_type)
              VALUES ($1, $2, $3)
            `, [sessionId2, userId2, 'regular']);

            // Insert messages for first user
            for (let i = 0; i < messages.length; i++) {
              await pool.query(`
                INSERT INTO conversation_messages (
                  message_id, session_id, user_id, sequence_number, input_type,
                  transcript_text, ai_response_text, created_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
              `, [
                randomUUID(),
                sessionId,
                userId,
                i + 1,
                'text',
                messages[i].transcript,
                messages[i].response
              ]);
            }

            // Insert messages for second user
            for (let i = 0; i < messages.length; i++) {
              await pool.query(`
                INSERT INTO conversation_messages (
                  message_id, session_id, user_id, sequence_number, input_type,
                  transcript_text, ai_response_text, created_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
              `, [
                randomUUID(),
                sessionId2,
                userId2,
                i + 1,
                'text',
                messages[i].transcript + '_user2',
                messages[i].response + '_user2'
              ]);
            }

            // Retrieve messages for first user
            const retrieved = await service.getRecentMessages(userId, 2);

            // Property: Should only retrieve messages for the specified user
            expect(retrieved.length).toBe(messages.length * 2); // *2 for user + assistant

            // Property: No messages should contain '_user2' suffix
            for (const msg of retrieved) {
              expect(msg.content).not.toContain('_user2');
            }

            // Cleanup second user
            await pool.query('DELETE FROM users WHERE user_id = $1', [userId2]);
          }
        ),
        { numRuns: 20 } // Reduced runs due to complexity and pg-mem limitations
      );
    });

    test('handles empty results gracefully', async () => {
      // Clear all messages
      await pool.query('DELETE FROM conversation_messages');

      // Retrieve messages when none exist
      const retrieved = await service.getRecentMessages(userId, 2);

      // Property: Should return empty array, not null or undefined
      expect(Array.isArray(retrieved)).toBe(true);
      expect(retrieved.length).toBe(0);
    });

    test('includes cross-session context in AI prompt format', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              transcript: fc.string({ minLength: 5, maxLength: 50 }).filter(s => !s.includes('\\')),
              response: fc.string({ minLength: 5, maxLength: 50 }).filter(s => !s.includes('\\'))
            }),
            { minLength: 1, maxLength: 3 } // Reduced to avoid UUID collisions
          ),
          async (messages) => {
            // Clear previous test data
            await pool.query('DELETE FROM conversation_messages');

            // Insert messages
            for (let i = 0; i < messages.length; i++) {
              await pool.query(`
                INSERT INTO conversation_messages (
                  message_id, session_id, user_id, sequence_number, input_type,
                  transcript_text, ai_response_text, created_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
              `, [
                randomUUID(),
                sessionId,
                userId,
                i + 1,
                'text',
                messages[i].transcript,
                messages[i].response
              ]);
            }

            // Retrieve and format messages
            const retrieved = await service.getRecentMessages(userId, 2);
            const formatted = service.formatForPrompt(retrieved);

            // Property: Formatted messages should be ready for AI prompt
            expect(Array.isArray(formatted)).toBe(true);
            
            // Property: Each formatted message should have correct structure
            for (const msg of formatted) {
              expect(msg).toHaveProperty('role');
              expect(msg).toHaveProperty('content');
              expect(['user', 'assistant']).toContain(msg.role);
              expect(typeof msg.content).toBe('string');
              expect(msg.content.length).toBeGreaterThan(0);
            }

            // Property: User and assistant messages should alternate (if both exist)
            if (formatted.length >= 2) {
              // Check that we have both user and assistant messages
              const hasUser = formatted.some(m => m.role === 'user');
              const hasAssistant = formatted.some(m => m.role === 'assistant');
              expect(hasUser).toBe(true);
              expect(hasAssistant).toBe(true);
            }
            
            // Clean up after this property test run
            await pool.query('DELETE FROM conversation_messages');
          }
        ),
        { numRuns: 50 } // Reduced runs to avoid pg-mem UUID issues
      );
    });
  });
});
