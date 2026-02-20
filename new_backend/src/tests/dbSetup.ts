/**
 * In-Memory Database Setup for Testing
 * 
 * This module provides pg-mem setup for testing database operations
 * without requiring a real PostgreSQL instance.
 */

import { newDb, IMemoryDb } from 'pg-mem';
import { Pool } from 'pg';

/**
 * Creates an in-memory PostgreSQL database for testing
 */
export function createTestDatabase(): { db: IMemoryDb; pool: any } {
  const db = newDb();

  // Register common PostgreSQL extensions
  db.public.registerFunction({
    name: 'current_database',
    implementation: () => 'test_db',
  });

  db.public.registerFunction({
    name: 'version',
    implementation: () => 'PostgreSQL 14.0 (pg-mem)',
  });

  db.public.registerFunction({
    name: 'gen_random_uuid',
    implementation: () => {
      // Generate proper UUID v4 format
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
  });

  // Create a connection pool adapter
  const { Pool } = db.adapters.createPg();
  const pool = new Pool();

  return { db, pool };
}

/**
 * Initializes the test database with the SAMA schema
 */
export async function initializeTestSchema(pool: any): Promise<void> {
  // Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User preferences table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_preferences (
      preference_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      nickname VARCHAR(50),
      voice_gender VARCHAR(10),
      emotional_attachment INT DEFAULT 7,
      preferred_language VARCHAR(10) DEFAULT 'en',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Conversation sessions table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS conversation_sessions (
      session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      session_type VARCHAR(50) DEFAULT 'regular',
      start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      end_time TIMESTAMP,
      duration_seconds INT
    )
  `);

  // Conversation messages table (simplified for pg-mem compatibility)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS conversation_messages (
      message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL REFERENCES conversation_sessions(session_id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      sequence_number INT NOT NULL,
      input_type VARCHAR(20) NOT NULL,
      transcript_text TEXT,
      audio_file_url TEXT,
      transcript_confidence FLOAT,
      ai_response_text TEXT,
      ai_response_audio_url TEXT,
      response_emotion_tone VARCHAR(50),
      time_of_day VARCHAR(20),
      detected_context TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Emotion analysis table (simplified for pg-mem compatibility)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS emotion_analysis (
      analysis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      message_id UUID REFERENCES conversation_messages(message_id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      primary_emotion VARCHAR(50),
      emotion_intensity FLOAT,
      detected_emotions JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Dosha profiles table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS dosha_profiles (
      profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      primary_dosha VARCHAR(20),
      prakriti_scores JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Dosha tracking table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS dosha_tracking (
      tracking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      dosha_type VARCHAR(20),
      intensity INT,
      tracked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Recommendations table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS recommendations (
      recommendation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      session_id UUID REFERENCES conversation_sessions(session_id) ON DELETE CASCADE,
      knowledge_id UUID,
      title VARCHAR(255),
      content_type VARCHAR(50),
      duration_minutes INT,
      why TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Crisis events table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS crisis_events (
      event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      session_id UUID REFERENCES conversation_sessions(session_id) ON DELETE CASCADE,
      message_text TEXT,
      crisis_level VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for performance
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_conversation_messages_user_id 
    ON conversation_messages(user_id)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_conversation_messages_session_id 
    ON conversation_messages(session_id)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_conversation_messages_created_at 
    ON conversation_messages(created_at)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_emotion_analysis_user_id 
    ON emotion_analysis(user_id)
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_dosha_tracking_user_id 
    ON dosha_tracking(user_id)
  `);
}

/**
 * Seeds the test database with sample data
 */
export async function seedTestData(pool: any): Promise<{
  userId: string;
  sessionId: string;
}> {
  // Create test user
  const userResult = await pool.query(`
    INSERT INTO users (email, password_hash, name)
    VALUES ($1, $2, $3)
    RETURNING user_id
  `, ['test@example.com', 'hashed_password', 'Test User']);

  const userId = userResult.rows[0].user_id;

  // Create user preferences
  await pool.query(`
    INSERT INTO user_preferences (user_id, nickname, voice_gender, emotional_attachment)
    VALUES ($1, $2, $3, $4)
  `, [userId, 'TestNick', 'female', 7]);

  // Create dosha profile
  await pool.query(`
    INSERT INTO dosha_profiles (user_id, primary_dosha, prakriti_scores)
    VALUES ($1, $2, $3)
  `, [userId, 'VATA', JSON.stringify({ VATA: 60, PITTA: 25, KAPHA: 15 })]);

  // Create conversation session
  const sessionResult = await pool.query(`
    INSERT INTO conversation_sessions (user_id, session_type)
    VALUES ($1, $2)
    RETURNING session_id
  `, [userId, 'regular']);

  const sessionId = sessionResult.rows[0].session_id;

  return { userId, sessionId };
}

/**
 * Clears all data from test database tables
 */
export async function clearTestData(pool: any): Promise<void> {
  await pool.query('DELETE FROM crisis_events');
  await pool.query('DELETE FROM recommendations');
  await pool.query('DELETE FROM emotion_analysis');
  await pool.query('DELETE FROM conversation_messages');
  await pool.query('DELETE FROM conversation_sessions');
  await pool.query('DELETE FROM dosha_tracking');
  await pool.query('DELETE FROM dosha_profiles');
  await pool.query('DELETE FROM user_preferences');
  await pool.query('DELETE FROM users');
}

/**
 * Creates a complete test environment with database and sample data
 */
export async function setupTestEnvironment(): Promise<{
  db: IMemoryDb;
  pool: any;
  userId: string;
  sessionId: string;
  cleanup: () => Promise<void>;
}> {
  const { db, pool } = createTestDatabase();
  await initializeTestSchema(pool);
  const { userId, sessionId } = await seedTestData(pool);

  const cleanup = async () => {
    await clearTestData(pool);
  };

  return { db, pool, userId, sessionId, cleanup };
}
