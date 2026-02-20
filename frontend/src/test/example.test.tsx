/**
 * Example Test File for Frontend
 * 
 * This file demonstrates the usage of the testing infrastructure and utilities.
 * It can be used as a reference for writing property-based tests and unit tests.
 */

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  messageArbitrary,
  emotionArbitrary,
  recommendationArbitrary,
  chatResponseArbitrary,
  voiceResponseArbitrary,
  sessionIdArbitrary
} from './generators';
import {
  createMockChatResponse,
  createMockVoiceResponse,
  createMockRecommendation,
  assertChatResponseStructure,
  assertVoiceResponseStructure
} from './testUtilities';

describe('Frontend Testing Infrastructure Examples', () => {
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

    // Feature: sama-chat-integration, Property Example: Recommendation Structure
    test('recommendationArbitrary generates valid recommendations', () => {
      fc.assert(
        fc.property(recommendationArbitrary, (rec) => {
          expect(rec).toHaveProperty('knowledge_id');
          expect(rec).toHaveProperty('title');
          expect(rec).toHaveProperty('content_type');
          expect(rec).toHaveProperty('why');
          expect(typeof rec.title).toBe('string');
          expect(rec.title.length).toBeGreaterThan(0);
        }),
        { numRuns: 100 }
      );
    });

    // Feature: sama-chat-integration, Property Example: Chat Response Structure
    test('chatResponseArbitrary generates valid response structure', () => {
      fc.assert(
        fc.property(chatResponseArbitrary, (response) => {
          assertChatResponseStructure(response);
          expect(response.success).toBe(true);
          expect(Array.isArray(response.data.recommendations)).toBe(true);
          expect(typeof response.data.is_crisis).toBe('boolean');
        }),
        { numRuns: 100 }
      );
    });

    // Feature: sama-chat-integration, Property Example: Voice Response Structure
    test('voiceResponseArbitrary generates valid voice response structure', () => {
      fc.assert(
        fc.property(voiceResponseArbitrary, (response) => {
          assertVoiceResponseStructure(response);
          expect(response.success).toBe(true);
          expect(typeof response.data.transcript).toBe('string');
          expect(response.data.transcript_confidence).toBeGreaterThanOrEqual(0);
          expect(response.data.transcript_confidence).toBeLessThanOrEqual(1);
        }),
        { numRuns: 100 }
      );
    });

    // Feature: sama-chat-integration, Property Example: Session ID Format
    test('sessionIdArbitrary generates valid UUID format', () => {
      fc.assert(
        fc.property(sessionIdArbitrary, (sessionId) => {
          expect(typeof sessionId).toBe('string');
          // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
          // fast-check may generate minimal UUIDs, so we check basic structure
          const parts = sessionId.split('-');
          expect(parts.length).toBe(5);
          expect(parts[0].length).toBe(8);
          expect(parts[1].length).toBe(4);
          expect(parts[2].length).toBe(4);
          expect(parts[3].length).toBe(4);
          expect(parts[4].length).toBe(12);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Mock Data Factories', () => {
    test('createMockChatResponse creates valid structure', () => {
      const response = createMockChatResponse();
      assertChatResponseStructure(response);
      expect(response.success).toBe(true);
    });

    test('createMockChatResponse accepts overrides', () => {
      const response = createMockChatResponse({
        reply: 'Custom reply',
        emotion: { primary: 'joy', intensity: 0.8 },
        is_crisis: true
      });
      
      expect(response.data.reply).toBe('Custom reply');
      expect(response.data.emotion.primary).toBe('joy');
      expect(response.data.emotion.intensity).toBe(0.8);
      expect(response.data.is_crisis).toBe(true);
    });

    test('createMockVoiceResponse creates valid structure', () => {
      const response = createMockVoiceResponse();
      assertVoiceResponseStructure(response);
      expect(response.success).toBe(true);
    });

    test('createMockVoiceResponse accepts overrides', () => {
      const response = createMockVoiceResponse({
        transcript: 'Custom transcript',
        transcript_confidence: 0.99,
        reply_text: 'Custom reply'
      });
      
      expect(response.data.transcript).toBe('Custom transcript');
      expect(response.data.transcript_confidence).toBe(0.99);
      expect(response.data.reply_text).toBe('Custom reply');
    });

    test('createMockRecommendation creates valid structure', () => {
      const rec = createMockRecommendation();
      
      expect(rec).toHaveProperty('knowledge_id');
      expect(rec).toHaveProperty('title');
      expect(rec).toHaveProperty('content_type');
      expect(rec).toHaveProperty('duration_minutes');
      expect(rec).toHaveProperty('why');
    });

    test('createMockRecommendation accepts overrides', () => {
      const rec = createMockRecommendation({
        title: 'Custom Exercise',
        content_type: 'yoga',
        duration_minutes: 15
      });
      
      expect(rec.title).toBe('Custom Exercise');
      expect(rec.content_type).toBe('yoga');
      expect(rec.duration_minutes).toBe(15);
    });
  });
});
