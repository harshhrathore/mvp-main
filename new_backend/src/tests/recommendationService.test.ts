/**
 * Tests for dosha-specific recommendation generation
 */

import { buildRecommendations } from '../services/recommendationService';
import { KnowledgeRow } from '../types';

describe('Dosha-Specific Recommendation Service', () => {
  const mockKnowledge: KnowledgeRow[] = [
    {
      knowledge_id: 'k1',
      content_type: 'tea',
      title: 'Warm Herbal Tea',
      description_short: 'Calming tea blend',
      description_detailed: null,
      balances_doshas: ['Vata'],
      aggravates_doshas: [],
      best_for_season: null,
      best_time_of_day: 'evening',
      helps_with_emotions: ['anxious', 'stressed'],
      duration_minutes: 10,
      difficulty: 'easy',
      steps: null,
      precautions: [],
      video_url: null,
      traditional_source: null,
      user_success_rate: 0.85,
      times_recommended: 100,
      avg_effectiveness: 4.2,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      knowledge_id: 'k2',
      content_type: 'breathing',
      title: 'Cooling Breath',
      description_short: 'Shitali pranayama',
      description_detailed: null,
      balances_doshas: ['Pitta'],
      aggravates_doshas: [],
      best_for_season: null,
      best_time_of_day: 'afternoon',
      helps_with_emotions: ['angry', 'frustrated'],
      duration_minutes: 5,
      difficulty: 'easy',
      steps: null,
      precautions: [],
      video_url: null,
      traditional_source: null,
      user_success_rate: 0.90,
      times_recommended: 150,
      avg_effectiveness: 4.5,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      knowledge_id: 'k3',
      content_type: 'movement',
      title: 'Dynamic Yoga Flow',
      description_short: 'Energizing practice',
      description_detailed: null,
      balances_doshas: ['Kapha'],
      aggravates_doshas: [],
      best_for_season: null,
      best_time_of_day: 'morning',
      helps_with_emotions: ['tired', 'sluggish'],
      duration_minutes: 20,
      difficulty: 'moderate',
      steps: null,
      precautions: [],
      video_url: null,
      traditional_source: null,
      user_success_rate: 0.88,
      times_recommended: 120,
      avg_effectiveness: 4.3,
      created_at: '2024-01-01T00:00:00Z',
    },
  ];

  describe('VATA recommendations', () => {
    it('should generate grounding, warming recommendations for VATA', () => {
      const recommendations = buildRecommendations(mockKnowledge, 'anxious', 'Vata');
      
      expect(recommendations).toHaveLength(3);
      expect(recommendations[0].why).toContain('ground');
      expect(recommendations[0].why).toContain('Vata');
      expect(recommendations[0].why).toContain('anxiety');
    });

    it('should include tea-specific VATA template', () => {
      const recommendations = buildRecommendations([mockKnowledge[0]], 'stressed', 'Vata');
      
      expect(recommendations[0].why).toContain('Warm herbal tea');
      expect(recommendations[0].why).toContain('ground');
      expect(recommendations[0].why).toContain('stress');
    });
  });

  describe('PITTA recommendations', () => {
    it('should generate cooling, calming recommendations for PITTA', () => {
      const recommendations = buildRecommendations(mockKnowledge, 'angry', 'Pitta');
      
      expect(recommendations).toHaveLength(3);
      expect(recommendations[1].why.toLowerCase()).toContain('cool');
      expect(recommendations[1].why).toContain('Pitta');
      expect(recommendations[1].why).toContain('anger');
    });

    it('should include breathing-specific PITTA template', () => {
      const recommendations = buildRecommendations([mockKnowledge[1]], 'frustrated', 'Pitta');
      
      expect(recommendations[0].why).toContain('Cooling breath');
      expect(recommendations[0].why).toContain('Pitta');
      expect(recommendations[0].why).toContain('frustration');
    });
  });

  describe('KAPHA recommendations', () => {
    it('should generate energizing, stimulating recommendations for KAPHA', () => {
      const recommendations = buildRecommendations(mockKnowledge, 'tired', 'Kapha');
      
      expect(recommendations).toHaveLength(3);
      expect(recommendations[2].why).toContain('energize');
      expect(recommendations[2].why).toContain('Kapha');
      expect(recommendations[2].why).toContain('fatigue');
    });

    it('should include movement-specific KAPHA template', () => {
      const recommendations = buildRecommendations([mockKnowledge[2]], 'tired', 'Kapha');
      
      expect(recommendations[0].why).toContain('Active movement');
      expect(recommendations[0].why).toContain('Kapha');
      expect(recommendations[0].why).toContain('fatigue');
    });
  });

  describe('Emotion context integration', () => {
    it('should include emotion-specific context in recommendations', () => {
      const emotionMappings = [
        { input: 'anxious', expected: 'anxiety' },
        { input: 'stressed', expected: 'stress' },
        { input: 'sad', expected: 'sadness' },
        { input: 'angry', expected: 'anger' },
        { input: 'frustrated', expected: 'frustration' },
      ];
      
      emotionMappings.forEach(({ input, expected }) => {
        const recommendations = buildRecommendations([mockKnowledge[0]], input, 'Vata');
        expect(recommendations[0].why).toContain(expected);
      });
    });

    it('should handle neutral emotion gracefully', () => {
      const recommendations = buildRecommendations([mockKnowledge[0]], 'neutral', 'Vata');
      
      expect(recommendations[0].why).toContain('current state');
    });
  });

  describe('Content type matching', () => {
    it('should match content types to appropriate templates', () => {
      const contentTypes = [
        { type: 'tea', dosha: 'Vata', keyword: 'tea' },
        { type: 'breathing', dosha: 'Pitta', keyword: 'breath' },
        { type: 'movement', dosha: 'Kapha', keyword: 'movement' },
        { type: 'meditation', dosha: 'Vata', keyword: 'meditation' },
        { type: 'yoga', dosha: 'Pitta', keyword: 'yoga' },
      ];

      contentTypes.forEach(({ type, dosha, keyword }) => {
        const knowledge = [{ ...mockKnowledge[0], content_type: type }];
        const recommendations = buildRecommendations(knowledge, 'neutral', dosha);
        
        expect(recommendations[0].why.toLowerCase()).toContain(keyword);
      });
    });

    it('should use default template for unknown content types', () => {
      const knowledge = [{ ...mockKnowledge[0], content_type: 'unknown_type' }];
      const recommendations = buildRecommendations(knowledge, 'neutral', 'Vata');
      
      expect(recommendations[0].why).toContain('This practice helps');
      expect(recommendations[0].why).toContain('Vata');
    });
  });

  describe('Recommendation structure', () => {
    it('should return all required fields', () => {
      const recommendations = buildRecommendations(mockKnowledge, 'anxious', 'Vata');
      
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('knowledge_id');
        expect(rec).toHaveProperty('title');
        expect(rec).toHaveProperty('content_type');
        expect(rec).toHaveProperty('duration_minutes');
        expect(rec).toHaveProperty('why');
        expect(typeof rec.why).toBe('string');
        expect(rec.why.length).toBeGreaterThan(0);
      });
    });

    it('should limit recommendations to 3 items', () => {
      const manyKnowledge = [...mockKnowledge, ...mockKnowledge, ...mockKnowledge];
      const recommendations = buildRecommendations(manyKnowledge, 'anxious', 'Vata');
      
      expect(recommendations).toHaveLength(3);
    });
  });
});
