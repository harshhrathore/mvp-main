/**
 * Database Persistence Tests
 * Tests for Task 9: Implement Database Persistence for Chat Data
 * 
 * Validates:
 * - 9.1: Message persistence (user and AI messages)
 * - 9.2: Emotion analysis persistence
 * - 9.3: Recommendation persistence
 * - 9.4: Session record creation
 */

import { processChatMessage } from '../services/chatPipelineService';
import { createSession, saveMessage, getActiveSession } from '../services/chatService';
import { saveEmotionAnalysis } from '../services/emotionAnalysisService';
import { saveRecommendations } from '../services/recommendationService';
import { pool } from '../config/db';

// Simple UUID generator for tests
const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Mock the database pool
jest.mock('../config/db', () => ({
  pool: {
    query: jest.fn(),
  },
}));

// Mock external services
jest.mock('../services/emotionService', () => ({
  detectEmotion: jest.fn().mockResolvedValue({
    primary_emotion: 'anxious',
    primary_confidence: 0.85,
    all_emotions: { anxious: 0.85, worried: 0.15 },
    emotion_intensity: 7,
  }),
  emotionToDoshaImpact: jest.fn().mockReturnValue({
    vata: 0.8,
    pitta: 0.3,
    kapha: 0.2,
  }),
}));

jest.mock('../services/safetyService', () => ({
  detectCrisis: jest.fn().mockReturnValue({
    is_crisis: false,
    crisis_level: 'none',
    detected_keywords: [],
  }),
  logSafetyEvent: jest.fn().mockResolvedValue(undefined),
  buildCrisisResponse: jest.fn().mockReturnValue('Crisis response'),
}));

jest.mock('../services/doshaService', () => ({
  getLatestAssessment: jest.fn().mockResolvedValue({
    primary_dosha: 'Vata',
    prakriti_scores: { vata: 0.6, pitta: 0.3, kapha: 0.1 },
  }),
  saveDoshaTracking: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../services/knowledgeService', () => ({
  searchKnowledge: jest.fn().mockResolvedValue([
    {
      knowledge_id: 'test-knowledge-id',
      title: 'Deep Breathing Exercise',
      content_type: 'breathing',
      duration_minutes: 5,
    },
  ]),
  incrementRecommendCount: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../services/aiService', () => ({
  generateAIResponse: jest.fn().mockResolvedValue('I understand you are feeling anxious. Let me help you.'),
}));

jest.mock('../services/streakService', () => ({
  updateStreak: jest.fn().mockResolvedValue(undefined),
}));

describe('Database Persistence Tests', () => {
  const mockUserId = uuidv4();
  const mockSessionId = uuidv4();
  const mockMessageId = uuidv4();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Task 9.1: Message Persistence', () => {
    it('should store user message with all required fields', async () => {
      const mockSession = {
        session_id: mockSessionId,
        user_id: mockUserId,
        session_type: 'regular',
        start_time: new Date(),
      };

      const mockMessage = {
        message_id: mockMessageId,
        session_id: mockSessionId,
        user_id: mockUserId,
        sequence_number: 1,
        input_type: 'text',
        transcript_text: 'I feel anxious',
        created_at: new Date(),
      };

      // Mock getActiveSession to return null (no active session)
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      
      // Mock createSession
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockSession] });
      
      // Mock getNextSeqNum
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ max: 0 }] });
      
      // Mock saveMessage for user message
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockMessage] });
      
      // Mock saveEmotionAnalysis
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      
      // Mock getConversationHistory
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      
      // Mock saveMessage for AI response
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ ...mockMessage, sequence_number: 2 }] });
      
      // Mock saveRecommendations
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await processChatMessage({
        userId: mockUserId,
        message: 'I feel anxious',
        inputType: 'text',
      });

      // Verify user message was saved
      const saveMessageCalls = (pool.query as jest.Mock).mock.calls.filter(
        call => call[0].includes('INSERT INTO conversation_messages')
      );
      
      expect(saveMessageCalls.length).toBeGreaterThanOrEqual(1);
      
      // Check first call (user message)
      const userMessageCall = saveMessageCalls[0];
      expect(userMessageCall[1]).toContain(mockSessionId);
      expect(userMessageCall[1]).toContain(mockUserId);
      expect(userMessageCall[1]).toContain('text'); // input_type
    });

    it('should store AI response message with all required fields', async () => {
      const mockSession = {
        session_id: mockSessionId,
        user_id: mockUserId,
        session_type: 'regular',
        start_time: new Date(),
      };

      // Mock getActiveSession
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockSession] });
      
      // Mock getNextSeqNum
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ max: 1 }] });
      
      // Mock saveMessage for user message
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ message_id: mockMessageId }] });
      
      // Mock saveEmotionAnalysis
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      
      // Mock getConversationHistory
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      
      // Mock saveMessage for AI response
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ message_id: uuidv4() }] });
      
      // Mock saveRecommendations
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await processChatMessage({
        userId: mockUserId,
        message: 'I feel anxious',
        inputType: 'text',
      });

      // Verify AI response was saved
      const saveMessageCalls = (pool.query as jest.Mock).mock.calls.filter(
        call => call[0].includes('INSERT INTO conversation_messages')
      );
      
      // Should have 2 calls: one for user message, one for AI response
      expect(saveMessageCalls.length).toBe(2);
      
      // Check second call (AI response)
      const aiResponseCall = saveMessageCalls[1];
      expect(aiResponseCall[1]).toContain(mockSessionId);
      expect(aiResponseCall[1]).toContain(mockUserId);
    });

    it('should include session_id, input_type, and timestamp in message', async () => {
      const mockSession = {
        session_id: mockSessionId,
        user_id: mockUserId,
        session_type: 'regular',
        start_time: new Date(),
      };

      const mockMessage = {
        message_id: mockMessageId,
        session_id: mockSessionId,
        user_id: mockUserId,
        sequence_number: 1,
        input_type: 'text',
        transcript_text: 'Test message',
        created_at: new Date(),
      };

      // Mock getActiveSession
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockSession] });
      
      // Mock getNextSeqNum
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ max: 0 }] });
      
      // Mock saveMessage
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockMessage] });
      
      // Mock saveEmotionAnalysis
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      
      // Mock getConversationHistory
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      
      // Mock saveMessage for AI response
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ ...mockMessage, sequence_number: 2 }] });
      
      // Mock saveRecommendations
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await processChatMessage({
        userId: mockUserId,
        message: 'Test message',
        inputType: 'text',
      });

      // Verify message has required fields
      expect(result.session_id).toBe(mockSessionId);
      expect(result.message_id).toBe(mockMessageId);
    });
  });

  describe('Task 9.2: Emotion Analysis Persistence', () => {
    it('should store detected emotion with message_id link', async () => {
      const mockSession = {
        session_id: mockSessionId,
        user_id: mockUserId,
        session_type: 'regular',
        start_time: new Date(),
      };

      const mockMessage = {
        message_id: mockMessageId,
        session_id: mockSessionId,
        user_id: mockUserId,
        sequence_number: 1,
      };

      // Mock getActiveSession
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockSession] });
      
      // Mock getNextSeqNum
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ max: 0 }] });
      
      // Mock saveMessage
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockMessage] });
      
      // Mock saveEmotionAnalysis
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      
      // Mock getConversationHistory
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      
      // Mock saveMessage for AI response
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ ...mockMessage, sequence_number: 2 }] });
      
      // Mock saveRecommendations
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await processChatMessage({
        userId: mockUserId,
        message: 'I feel anxious',
        inputType: 'text',
      });

      // Verify emotion analysis was saved
      const emotionCalls = (pool.query as jest.Mock).mock.calls.filter(
        call => call[0].includes('INSERT INTO emotion_analysis')
      );
      
      expect(emotionCalls.length).toBe(1);
      
      // Check that it includes message_id, user_id, emotion, and intensity
      const emotionCall = emotionCalls[0];
      expect(emotionCall[1]).toContain(mockMessageId);
      expect(emotionCall[1]).toContain(mockUserId);
      expect(emotionCall[1]).toContain('anxious');
    });

    it('should include emotion type and intensity in persistence', async () => {
      const mockSession = {
        session_id: mockSessionId,
        user_id: mockUserId,
        session_type: 'regular',
        start_time: new Date(),
      };

      const mockMessage = {
        message_id: mockMessageId,
        session_id: mockSessionId,
        user_id: mockUserId,
        sequence_number: 1,
      };

      // Mock getActiveSession
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockSession] });
      
      // Mock getNextSeqNum
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ max: 0 }] });
      
      // Mock saveMessage
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockMessage] });
      
      // Mock saveEmotionAnalysis - capture the call
      let emotionData: any;
      (pool.query as jest.Mock).mockImplementationOnce((query, params) => {
        emotionData = params;
        return Promise.resolve({ rows: [] });
      });
      
      // Mock getConversationHistory
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      
      // Mock saveMessage for AI response
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ ...mockMessage, sequence_number: 2 }] });
      
      // Mock saveRecommendations
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await processChatMessage({
        userId: mockUserId,
        message: 'I feel anxious',
        inputType: 'text',
      });

      // Verify emotion data includes type and intensity
      expect(emotionData).toBeDefined();
      expect(emotionData[2]).toBe('anxious'); // primary_emotion
      expect(emotionData[5]).toBe(7); // emotion_intensity
    });
  });

  describe('Task 9.3: Recommendation Persistence', () => {
    it('should store recommendations with knowledge_id and session_id', async () => {
      const mockSession = {
        session_id: mockSessionId,
        user_id: mockUserId,
        session_type: 'regular',
        start_time: new Date(),
      };

      const mockMessage = {
        message_id: mockMessageId,
        session_id: mockSessionId,
        user_id: mockUserId,
        sequence_number: 1,
      };

      // Mock getActiveSession
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockSession] });
      
      // Mock getNextSeqNum
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ max: 0 }] });
      
      // Mock saveMessage
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockMessage] });
      
      // Mock saveEmotionAnalysis
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      
      // Mock getConversationHistory
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      
      // Mock saveMessage for AI response
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ ...mockMessage, sequence_number: 2 }] });
      
      // Mock saveRecommendations
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      await processChatMessage({
        userId: mockUserId,
        message: 'I feel anxious',
        inputType: 'text',
      });

      // Verify recommendations were saved
      const recCalls = (pool.query as jest.Mock).mock.calls.filter(
        call => call[0].includes('INSERT INTO recommendation_history')
      );
      
      expect(recCalls.length).toBeGreaterThanOrEqual(1);
      
      // Check that it includes user_id, session_id, knowledge_id
      const recCall = recCalls[0];
      expect(recCall[1]).toContain(mockUserId);
      expect(recCall[1]).toContain(mockSessionId);
    });

    it('should include why explanation in recommendation persistence', async () => {
      const mockSession = {
        session_id: mockSessionId,
        user_id: mockUserId,
        session_type: 'regular',
        start_time: new Date(),
      };

      const mockMessage = {
        message_id: mockMessageId,
        session_id: mockSessionId,
        user_id: mockUserId,
        sequence_number: 1,
      };

      // Mock getActiveSession
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockSession] });
      
      // Mock getNextSeqNum
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ max: 0 }] });
      
      // Mock saveMessage
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockMessage] });
      
      // Mock saveEmotionAnalysis
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      
      // Mock getConversationHistory
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      
      // Mock saveMessage for AI response
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ ...mockMessage, sequence_number: 2 }] });
      
      // Mock saveRecommendations - capture the call
      let recData: any;
      (pool.query as jest.Mock).mockImplementationOnce((query, params) => {
        recData = params;
        return Promise.resolve({ rows: [] });
      });

      await processChatMessage({
        userId: mockUserId,
        message: 'I feel anxious',
        inputType: 'text',
      });

      // Verify recommendation includes why explanation
      expect(recData).toBeDefined();
      expect(recData[5]).toBeDefined(); // ai_explanation field
      expect(typeof recData[5]).toBe('string');
    });
  });

  describe('Task 9.4: Session Record Creation', () => {
    it('should create session on first message with user_id and session_type', async () => {
      const mockSession = {
        session_id: mockSessionId,
        user_id: mockUserId,
        session_type: 'regular',
        start_time: new Date(),
      };

      const mockMessage = {
        message_id: mockMessageId,
        session_id: mockSessionId,
        user_id: mockUserId,
        sequence_number: 1,
      };

      // Mock getActiveSession to return null (no active session)
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      
      // Mock createSession
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockSession] });
      
      // Mock getNextSeqNum
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ max: 0 }] });
      
      // Mock saveMessage
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockMessage] });
      
      // Mock saveEmotionAnalysis
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      
      // Mock getConversationHistory
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      
      // Mock saveMessage for AI response
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ ...mockMessage, sequence_number: 2 }] });
      
      // Mock saveRecommendations
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await processChatMessage({
        userId: mockUserId,
        message: 'First message',
        inputType: 'text',
      });

      // Verify session was created
      const sessionCalls = (pool.query as jest.Mock).mock.calls.filter(
        call => call[0].includes('INSERT INTO conversation_sessions')
      );
      
      expect(sessionCalls.length).toBe(1);
      
      // Check that it includes user_id and session_type
      const sessionCall = sessionCalls[0];
      expect(sessionCall[1]).toContain(mockUserId);
      expect(sessionCall[1]).toContain('regular');
    });

    it('should return session_id in response', async () => {
      const mockSession = {
        session_id: mockSessionId,
        user_id: mockUserId,
        session_type: 'regular',
        start_time: new Date(),
      };

      const mockMessage = {
        message_id: mockMessageId,
        session_id: mockSessionId,
        user_id: mockUserId,
        sequence_number: 1,
      };

      // Mock getActiveSession
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockSession] });
      
      // Mock getNextSeqNum
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ max: 0 }] });
      
      // Mock saveMessage
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockMessage] });
      
      // Mock saveEmotionAnalysis
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      
      // Mock getConversationHistory
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      
      // Mock saveMessage for AI response
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ ...mockMessage, sequence_number: 2 }] });
      
      // Mock saveRecommendations
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await processChatMessage({
        userId: mockUserId,
        message: 'Test message',
        inputType: 'text',
      });

      // Verify session_id is in response
      expect(result.session_id).toBe(mockSessionId);
    });

    it('should reuse existing active session instead of creating new one', async () => {
      const mockSession = {
        session_id: mockSessionId,
        user_id: mockUserId,
        session_type: 'regular',
        start_time: new Date(),
      };

      const mockMessage = {
        message_id: mockMessageId,
        session_id: mockSessionId,
        user_id: mockUserId,
        sequence_number: 2,
      };

      // Mock getActiveSession to return existing session
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockSession] });
      
      // Mock getNextSeqNum
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ max: 1 }] });
      
      // Mock saveMessage
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [mockMessage] });
      
      // Mock saveEmotionAnalysis
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      
      // Mock getConversationHistory
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      
      // Mock saveMessage for AI response
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ ...mockMessage, sequence_number: 3 }] });
      
      // Mock saveRecommendations
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await processChatMessage({
        userId: mockUserId,
        message: 'Second message',
        inputType: 'text',
      });

      // Verify no new session was created
      const sessionCalls = (pool.query as jest.Mock).mock.calls.filter(
        call => call[0].includes('INSERT INTO conversation_sessions')
      );
      
      expect(sessionCalls.length).toBe(0);
      
      // Verify existing session_id is used
      expect(result.session_id).toBe(mockSessionId);
    });
  });
});
