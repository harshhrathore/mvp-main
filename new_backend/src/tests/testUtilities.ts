/**
 * Test Utilities
 * 
 * This module provides utility functions for testing the SAMA Chat Integration.
 */

import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

// ============================================================================
// Authentication Utilities
// ============================================================================

/**
 * Generates a test JWT token
 */
export function generateTestToken(userId: string, expiresIn: string | number = '1h'): string {
  const secret = process.env.JWT_SECRET || 'test_secret';
  return jwt.sign({ userId }, secret, { expiresIn } as jwt.SignOptions);
}

/**
 * Generates an expired JWT token
 */
export function generateExpiredToken(userId: string): string {
  const secret = process.env.JWT_SECRET || 'test_secret';
  return jwt.sign({ userId }, secret, { expiresIn: '-1h' } as jwt.SignOptions);
}

/**
 * Generates an invalid JWT token
 */
export function generateInvalidToken(): string {
  return 'invalid.jwt.token';
}

// ============================================================================
// Database Utilities
// ============================================================================

/**
 * Creates a test user in the database
 */
export async function createTestUser(
  pool: Pool,
  email: string = 'test@example.com',
  name: string = 'Test User'
): Promise<string> {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING user_id`,
    [email, 'hashed_password', name]
  );
  return result.rows[0].user_id;
}

/**
 * Creates test user preferences
 */
export async function createTestPreferences(
  pool: Pool,
  userId: string,
  preferences: {
    nickname?: string;
    voice_gender?: 'male' | 'female';
    emotional_attachment?: number;
    preferred_language?: string;
  } = {}
): Promise<void> {
  await pool.query(
    `INSERT INTO user_preferences (user_id, nickname, voice_gender, emotional_attachment, preferred_language)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      userId,
      preferences.nickname || null,
      preferences.voice_gender || null,
      preferences.emotional_attachment || 7,
      preferences.preferred_language || 'en'
    ]
  );
}

/**
 * Creates a test dosha profile
 */
export async function createTestDoshaProfile(
  pool: Pool,
  userId: string,
  primaryDosha: 'VATA' | 'PITTA' | 'KAPHA' = 'VATA'
): Promise<void> {
  const scores = {
    VATA: primaryDosha === 'VATA' ? 60 : 20,
    PITTA: primaryDosha === 'PITTA' ? 60 : 20,
    KAPHA: primaryDosha === 'KAPHA' ? 60 : 20
  };

  await pool.query(
    `INSERT INTO dosha_profiles (user_id, primary_dosha, prakriti_scores)
     VALUES ($1, $2, $3)`,
    [userId, primaryDosha, JSON.stringify(scores)]
  );
}

/**
 * Creates a test conversation session
 */
export async function createTestSession(
  pool: Pool,
  userId: string,
  sessionType: string = 'regular'
): Promise<string> {
  const result = await pool.query(
    `INSERT INTO conversation_sessions (user_id, session_type)
     VALUES ($1, $2)
     RETURNING session_id`,
    [userId, sessionType]
  );
  return result.rows[0].session_id;
}

/**
 * Creates test conversation messages
 */
export async function createTestMessages(
  pool: Pool,
  userId: string,
  sessionId: string,
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    createdAt?: Date;
  }>
): Promise<string[]> {
  const messageIds: string[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const result = await pool.query(
      `INSERT INTO conversation_messages 
       (session_id, user_id, sequence_number, input_type, transcript_text, ai_response_text, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING message_id`,
      [
        sessionId,
        userId,
        i + 1,
        'text',
        msg.role === 'user' ? msg.content : null,
        msg.role === 'assistant' ? msg.content : null,
        msg.createdAt || new Date()
      ]
    );
    messageIds.push(result.rows[0].message_id);
  }

  return messageIds;
}

/**
 * Creates test emotion analysis
 */
export async function createTestEmotionAnalysis(
  pool: Pool,
  userId: string,
  messageId: string,
  emotion: string = 'neutral',
  intensity: number = 0.5
): Promise<void> {
  await pool.query(
    `INSERT INTO emotion_analysis (message_id, user_id, primary_emotion, emotion_intensity)
     VALUES ($1, $2, $3, $4)`,
    [messageId, userId, emotion, intensity]
  );
}

/**
 * Creates test recommendations
 */
export async function createTestRecommendations(
  pool: Pool,
  userId: string,
  sessionId: string,
  count: number = 3
): Promise<void> {
  for (let i = 0; i < count; i++) {
    await pool.query(
      `INSERT INTO recommendations (user_id, session_id, knowledge_id, title, content_type, duration_minutes, why)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        sessionId,
        `knowledge-${i}`,
        `Test Recommendation ${i + 1}`,
        'meditation',
        5,
        'This will help you relax'
      ]
    );
  }
}

/**
 * Creates a test crisis event
 */
export async function createTestCrisisEvent(
  pool: Pool,
  userId: string,
  sessionId: string,
  messageText: string = 'I want to end it all'
): Promise<void> {
  await pool.query(
    `INSERT INTO crisis_events (user_id, session_id, message_text, crisis_level)
     VALUES ($1, $2, $3, $4)`,
    [userId, sessionId, messageText, 'high']
  );
}

// ============================================================================
// Mock Data Factories
// ============================================================================

/**
 * Creates a mock chat request
 */
export function createMockChatRequest(
  message: string,
  sessionId?: string
): { message: string; session_id?: string } {
  return {
    message,
    ...(sessionId && { session_id: sessionId })
  };
}

/**
 * Creates a mock voice request
 */
export function createMockVoiceRequest(
  audioBase64: string,
  sessionId?: string
): { audio: string; session_id?: string } {
  return {
    audio: audioBase64,
    ...(sessionId && { session_id: sessionId })
  };
}

/**
 * Creates a mock chat response
 */
export function createMockChatResponse(
  reply: string = 'Test response',
  emotion: { primary: string; intensity: number } = { primary: 'neutral', intensity: 0.5 },
  isCrisis: boolean = false
) {
  return {
    success: true,
    data: {
      reply,
      emotion,
      recommendations: [],
      is_crisis: isCrisis,
      meta: {
        session_id: '123e4567-e89b-12d3-a456-426614174000',
        message_id: '123e4567-e89b-12d3-a456-426614174001'
      }
    }
  };
}

/**
 * Creates a mock voice response
 */
export function createMockVoiceResponse(
  transcript: string = 'Test transcript',
  replyText: string = 'Test response'
) {
  return {
    success: true,
    data: {
      transcript,
      transcript_confidence: 0.95,
      reply_text: replyText,
      reply_audio_url: 'https://example.com/audio.mp3',
      emotion: { primary: 'neutral', intensity: 0.5 },
      recommendations: [],
      is_crisis: false,
      meta: {
        session_id: '123e4567-e89b-12d3-a456-426614174000',
        message_id: '123e4567-e89b-12d3-a456-426614174001'
      }
    }
  };
}

// ============================================================================
// Assertion Helpers
// ============================================================================

/**
 * Asserts that a response has the correct chat structure
 */
export function assertChatResponseStructure(response: any): void {
  expect(response).toHaveProperty('success');
  expect(response).toHaveProperty('data');
  expect(response.data).toHaveProperty('reply');
  expect(response.data).toHaveProperty('emotion');
  expect(response.data.emotion).toHaveProperty('primary');
  expect(response.data.emotion).toHaveProperty('intensity');
  expect(response.data).toHaveProperty('recommendations');
  expect(response.data).toHaveProperty('is_crisis');
  expect(response.data).toHaveProperty('meta');
  expect(response.data.meta).toHaveProperty('session_id');
  expect(response.data.meta).toHaveProperty('message_id');
}

/**
 * Asserts that a response has the correct voice structure
 */
export function assertVoiceResponseStructure(response: any): void {
  expect(response).toHaveProperty('success');
  expect(response).toHaveProperty('data');
  expect(response.data).toHaveProperty('transcript');
  expect(response.data).toHaveProperty('transcript_confidence');
  expect(response.data).toHaveProperty('reply_text');
  expect(response.data).toHaveProperty('reply_audio_url');
  expect(response.data).toHaveProperty('emotion');
  expect(response.data).toHaveProperty('recommendations');
  expect(response.data).toHaveProperty('is_crisis');
  expect(response.data).toHaveProperty('meta');
}

/**
 * Asserts that an emotion object is valid
 */
export function assertValidEmotion(emotion: any): void {
  expect(emotion).toHaveProperty('primary');
  expect(typeof emotion.primary).toBe('string');
  expect(emotion).toHaveProperty('intensity');
  expect(typeof emotion.intensity).toBe('number');
  expect(emotion.intensity).toBeGreaterThanOrEqual(0);
  expect(emotion.intensity).toBeLessThanOrEqual(1);
}

/**
 * Asserts that a recommendation object is valid
 */
export function assertValidRecommendation(recommendation: any): void {
  expect(recommendation).toHaveProperty('knowledge_id');
  expect(recommendation).toHaveProperty('title');
  expect(recommendation).toHaveProperty('content_type');
  expect(recommendation).toHaveProperty('why');
}

// ============================================================================
// Time Utilities
// ============================================================================

/**
 * Creates a date N days ago
 */
export function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Creates a date N hours ago
 */
export function hoursAgo(hours: number): Date {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date;
}

/**
 * Waits for a specified number of milliseconds
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
