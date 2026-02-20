/**
 * Unit tests for PreferencesService
 * Tests the new methods added for SAMA Chat Integration
 */

import { DataType, IMemoryDb, newDb } from 'pg-mem';

// Mock the pool before importing the service
let mockPool: any;

jest.mock('../config/db', () => ({
  pool: {
    query: (...args: any[]) => mockPool.query(...args)
  }
}));

import { 
  getPreferences, 
  updateVoiceGender, 
  updateEmotionalAttachment,
  updatePreferences 
} from '../services/preferencesService';

describe('PreferencesService - SAMA Chat Integration', () => {
  let db: IMemoryDb;
  let testUserId: string;

  beforeAll(() => {
    // Create in-memory database
    db = newDb();
    
    // Register UUID extension
    db.public.registerFunction({
      name: 'gen_random_uuid',
      returns: DataType.uuid,
      implementation: () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      },
    });

    // Create users table
    db.public.none(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create user_preferences table with new fields
    db.public.none(`
      CREATE TABLE user_preferences (
        pref_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        voice_gender VARCHAR(10) DEFAULT 'female',
        speaking_speed VARCHAR(10) DEFAULT 'normal',
        background_sounds BOOLEAN DEFAULT true,
        preferred_language VARCHAR(10) DEFAULT 'English',
        morning_reminder BOOLEAN DEFAULT true,
        evening_checkin BOOLEAN DEFAULT true,
        learning_level VARCHAR(20) DEFAULT 'beginner',
        data_for_research BOOLEAN DEFAULT false,
        emotional_attachment INTEGER DEFAULT 7,
        UNIQUE(user_id),
        CONSTRAINT chk_emotional_attachment CHECK (emotional_attachment >= 1 AND emotional_attachment <= 10)
      )
    `);

    // Insert test user
    const result = db.public.many(`
      INSERT INTO users (email, password_hash)
      VALUES ('test@example.com', 'hashedpassword')
      RETURNING id
    `);
    testUserId = result[0].id;

    // Get the pool adapter and assign to mockPool
    const { Pool } = db.adapters.createPg();
    mockPool = new Pool();
  });

  describe('getPreferences', () => {
    it('should create default preferences with emotional_attachment = 7', async () => {
      const prefs = await getPreferences(testUserId);
      
      expect(prefs).toBeDefined();
      expect(prefs.user_id).toBe(testUserId);
      expect(prefs.emotional_attachment).toBe(7);
      expect(prefs.voice_gender).toBe('female');
    });
  });

  describe('updateVoiceGender', () => {
    it('should update voice gender to male', async () => {
      const prefs = await updateVoiceGender(testUserId, 'male');
      
      expect(prefs.voice_gender).toBe('male');
      expect(prefs.user_id).toBe(testUserId);
    });

    it('should update voice gender to female', async () => {
      const prefs = await updateVoiceGender(testUserId, 'female');
      
      expect(prefs.voice_gender).toBe('female');
      expect(prefs.user_id).toBe(testUserId);
    });
  });

  describe('updateEmotionalAttachment', () => {
    it('should update emotional attachment to valid level', async () => {
      const prefs = await updateEmotionalAttachment(testUserId, 5);
      
      expect(prefs.emotional_attachment).toBe(5);
      expect(prefs.user_id).toBe(testUserId);
    });

    it('should update emotional attachment to minimum level (1)', async () => {
      const prefs = await updateEmotionalAttachment(testUserId, 1);
      
      expect(prefs.emotional_attachment).toBe(1);
    });

    it('should update emotional attachment to maximum level (10)', async () => {
      const prefs = await updateEmotionalAttachment(testUserId, 10);
      
      expect(prefs.emotional_attachment).toBe(10);
    });

    it('should throw error for level below 1', async () => {
      await expect(updateEmotionalAttachment(testUserId, 0))
        .rejects.toThrow('Emotional attachment level must be between 1 and 10');
    });

    it('should throw error for level above 10', async () => {
      await expect(updateEmotionalAttachment(testUserId, 11))
        .rejects.toThrow('Emotional attachment level must be between 1 and 10');
    });
  });

  describe('updatePreferences - integration with new fields', () => {
    it('should update both voice_gender and emotional_attachment together', async () => {
      const prefs = await updatePreferences(testUserId, {
        voice_gender: 'male',
        emotional_attachment: 8
      });
      
      expect(prefs.voice_gender).toBe('male');
      expect(prefs.emotional_attachment).toBe(8);
    });
  });
});
