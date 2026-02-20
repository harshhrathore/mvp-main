/**
 * Crisis Detection Integration Tests
 * Tests that crisis detection properly triggers Psychologist_Mode in SAMA personality
 */

import { detectCrisis } from '../services/safetyService';
import { SAMAPersonalityEngine } from '../services/samaPersonalityEngine';

describe('Crisis Detection Integration', () => {
  const samaEngine = new SAMAPersonalityEngine();

  describe('Crisis keyword detection', () => {
    it('should detect critical crisis keywords', () => {
      const crisisMessages = [
        'I want to kill myself',
        'I want to end my life',
        'suicide is the only way',
        'better off dead',
        'no reason to live',
      ];

      crisisMessages.forEach(message => {
        const result = detectCrisis(message);
        expect(result.is_crisis).toBe(true);
        expect(result.crisis_level).toBe('critical');
        expect(result.detected_keywords.length).toBeGreaterThan(0);
      });
    });

    it('should detect high-level crisis keywords', () => {
      const crisisMessages = [
        'I want to cut myself',
        'I want to hurt myself',
        'self harm is all I think about',
      ];

      crisisMessages.forEach(message => {
        const result = detectCrisis(message);
        expect(result.is_crisis).toBe(true);
        expect(result.crisis_level).toBe('high');
      });
    });

    it('should detect medium-level crisis keywords', () => {
      const crisisMessages = [
        "I can't go on anymore",
        'I feel hopeless',
        'everything is pointless',
        'no way out',
      ];

      crisisMessages.forEach(message => {
        const result = detectCrisis(message);
        expect(result.is_crisis).toBe(true);
        expect(result.crisis_level).toBe('medium');
      });
    });

    it('should not detect crisis in normal messages', () => {
      const normalMessages = [
        'I feel a bit sad today',
        'I am anxious about my exam',
        'I had a bad day at work',
      ];

      normalMessages.forEach(message => {
        const result = detectCrisis(message);
        expect(result.is_crisis).toBe(false);
        expect(result.crisis_level).toBe('low');
      });
    });
  });

  describe('SAMA Psychologist Mode triggering', () => {
    it('should trigger PSYCHOLOGIST_MODE for crisis messages', () => {
      const crisisMessages = [
        'I feel hopeless and want to end it all',
        'I want to kill myself',
        'I hate myself and want to die',
        "I can't go on anymore",
      ];

      crisisMessages.forEach(message => {
        const mode = samaEngine.detectMode(message);
        expect(mode).toBe('PSYCHOLOGIST_MODE');
      });
    });

    it('should use FRIEND_MODE for normal messages', () => {
      const normalMessages = [
        'I feel a bit anxious today',
        'Can you help me with stress?',
        'I had a bad day',
      ];

      normalMessages.forEach(message => {
        const mode = samaEngine.detectMode(message);
        expect(mode).toBe('FRIEND_MODE');
      });
    });
  });

  describe('Crisis detection and mode consistency', () => {
    it('should have consistent crisis detection between safety service and SAMA engine', () => {
      const testMessages = [
        { message: 'I want to kill myself', shouldBeCrisis: true },
        { message: 'I feel hopeless', shouldBeCrisis: true },
        { message: 'I am feeling sad', shouldBeCrisis: false },
        { message: 'Can you help me?', shouldBeCrisis: false },
      ];

      testMessages.forEach(({ message, shouldBeCrisis }) => {
        const safetyResult = detectCrisis(message);
        const samaMode = samaEngine.detectMode(message);

        if (shouldBeCrisis) {
          expect(safetyResult.is_crisis).toBe(true);
          expect(samaMode).toBe('PSYCHOLOGIST_MODE');
        } else {
          expect(safetyResult.is_crisis).toBe(false);
          expect(samaMode).toBe('FRIEND_MODE');
        }
      });
    });
  });
});
