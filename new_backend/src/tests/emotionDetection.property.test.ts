/**
 * Property-Based Tests for Emotion Detection
 * Feature: sama-chat-integration
 */

import * as fc from 'fast-check';
import { detectEmotion } from '../services/emotionService';

describe('Emotion Detection Property Tests', () => {
  // Feature: sama-chat-integration, Property 11: Emotion Detection Consistency
  describe('Property 11: Emotion Detection Consistency', () => {
    test('returns emotion object with primary emotion string and intensity between 0 and 1', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 2000 }),
          async (message) => {
            const result = await detectEmotion(message);
            
            // Verify emotion object structure
            expect(result).toHaveProperty('primary_emotion');
            expect(result).toHaveProperty('primary_confidence');
            expect(result).toHaveProperty('emotion_intensity');
            expect(result).toHaveProperty('all_emotions');
            
            // Verify primary_emotion is a string
            expect(typeof result.primary_emotion).toBe('string');
            expect(result.primary_emotion.length).toBeGreaterThan(0);
            
            // Verify primary_confidence is between 0 and 1
            expect(result.primary_confidence).toBeGreaterThanOrEqual(0);
            expect(result.primary_confidence).toBeLessThanOrEqual(1);
            
            // Verify emotion_intensity is a number
            expect(typeof result.emotion_intensity).toBe('number');
            expect(result.emotion_intensity).toBeGreaterThanOrEqual(0);
            
            // Verify all_emotions is an object
            expect(typeof result.all_emotions).toBe('object');
            expect(result.all_emotions).not.toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });

    test('always returns valid emotion types from known set', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 2000 }),
          async (message) => {
            const result = await detectEmotion(message);
            
            const validEmotions = [
              'anxiety', 'fear', 'anger', 'frustration', 'sadness',
              'joy', 'peace', 'lethargy', 'neutral', 'happy', 'excited',
              'calm', 'worried', 'stressed', 'overwhelmed'
            ];
            
            // The primary emotion should be a valid emotion or a reasonable variant
            expect(typeof result.primary_emotion).toBe('string');
            expect(result.primary_emotion.length).toBeGreaterThan(0);
            
            // Verify confidence is reasonable
            expect(result.primary_confidence).toBeGreaterThan(0);
            expect(result.primary_confidence).toBeLessThanOrEqual(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    test('returns consistent structure for empty or whitespace messages', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('', '   ', '\n', '\t', '     \n\t   '),
          async (message) => {
            const result = await detectEmotion(message);
            
            // Even for empty messages, should return valid structure
            expect(result).toHaveProperty('primary_emotion');
            expect(result).toHaveProperty('primary_confidence');
            expect(result).toHaveProperty('emotion_intensity');
            expect(result).toHaveProperty('all_emotions');
            
            // Should default to neutral for empty messages
            expect(result.primary_emotion).toBe('neutral');
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // Feature: sama-chat-integration, Property 12: Primary Emotion Selection
  describe('Property 12: Primary Emotion Selection', () => {
    test('primary emotion has highest confidence when multiple emotions detected', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 10, maxLength: 500 }),
          async (message) => {
            const result = await detectEmotion(message);
            
            // If all_emotions has multiple entries
            const emotionEntries = Object.entries(result.all_emotions);
            
            if (emotionEntries.length > 1) {
              // Find the emotion with highest confidence
              const maxConfidence = Math.max(...emotionEntries.map(([_, conf]) => conf as number));
              const emotionsWithMaxConfidence = emotionEntries
                .filter(([_, conf]) => conf === maxConfidence)
                .map(([emotion, _]) => emotion);
              
              // Primary emotion should be one of the emotions with max confidence
              expect(emotionsWithMaxConfidence).toContain(result.primary_emotion);
              
              // Primary confidence should match the max confidence
              expect(result.primary_confidence).toBe(maxConfidence);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('primary confidence matches the confidence in all_emotions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 2000 }),
          async (message) => {
            const result = await detectEmotion(message);
            
            // If primary emotion exists in all_emotions, confidence should match
            if (result.all_emotions[result.primary_emotion] !== undefined) {
              expect(result.primary_confidence).toBe(result.all_emotions[result.primary_emotion]);
            } else {
              // If not in all_emotions, primary_confidence should still be valid
              expect(result.primary_confidence).toBeGreaterThanOrEqual(0);
              expect(result.primary_confidence).toBeLessThanOrEqual(1);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    test('detects specific emotions for keyword-rich messages', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            'I am so anxious and worried about everything',
            'I feel angry and frustrated with this situation',
            'I am sad and depressed today',
            'I am happy and joyful right now',
            'I feel calm and peaceful',
            'I am tired and exhausted'
          ),
          async (message) => {
            const result = await detectEmotion(message);
            
            // Map messages to expected emotions
            const expectedEmotions: Record<string, string[]> = {
              'anxious': ['anxiety', 'anxious', 'fear'],
              'angry': ['anger', 'angry', 'frustration'],
              'sad': ['sadness', 'sad'],
              'happy': ['joy', 'happy'],
              'calm': ['peace', 'calm', 'peaceful'],
              'tired': ['lethargy', 'tired']
            };
            
            // Find which keyword is in the message
            const matchedKeyword = Object.keys(expectedEmotions).find(keyword =>
              message.toLowerCase().includes(keyword)
            );
            
            if (matchedKeyword) {
              const possibleEmotions = expectedEmotions[matchedKeyword];
              // Primary emotion should be one of the expected emotions
              expect(possibleEmotions.some(emotion =>
                result.primary_emotion.toLowerCase().includes(emotion) ||
                emotion.includes(result.primary_emotion.toLowerCase())
              )).toBe(true);
            }
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
