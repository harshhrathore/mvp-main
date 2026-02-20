/**
 * Integration test for dosha-specific recommendations in chat pipeline
 */

import { buildRecommendations } from '../services/recommendationService';
import { KnowledgeRow } from '../types';

describe('Dosha Recommendation Integration', () => {
  // Simulate realistic knowledge base results
  const vataKnowledge: KnowledgeRow[] = [
    {
      knowledge_id: 'k-vata-1',
      content_type: 'tea',
      title: 'Warm Ginger Tea',
      description_short: 'Grounding herbal blend',
      description_detailed: null,
      balances_doshas: ['Vata'],
      aggravates_doshas: ['Pitta'],
      best_for_season: 'winter',
      best_time_of_day: 'evening',
      helps_with_emotions: ['anxious', 'worried', 'restless'],
      duration_minutes: 10,
      difficulty: 'easy',
      steps: null,
      precautions: [],
      video_url: null,
      traditional_source: 'Ayurvedic texts',
      user_success_rate: 0.87,
      times_recommended: 250,
      avg_effectiveness: 4.3,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      knowledge_id: 'k-vata-2',
      content_type: 'breathing',
      title: 'Nadi Shodhana (Alternate Nostril Breathing)',
      description_short: 'Balancing pranayama',
      description_detailed: null,
      balances_doshas: ['Vata'],
      aggravates_doshas: [],
      best_for_season: 'any',
      best_time_of_day: 'morning',
      helps_with_emotions: ['anxious', 'stressed'],
      duration_minutes: 5,
      difficulty: 'easy',
      steps: null,
      precautions: [],
      video_url: null,
      traditional_source: 'Hatha Yoga Pradipika',
      user_success_rate: 0.92,
      times_recommended: 400,
      avg_effectiveness: 4.6,
      created_at: '2024-01-01T00:00:00Z',
    },
  ];

  const pittaKnowledge: KnowledgeRow[] = [
    {
      knowledge_id: 'k-pitta-1',
      content_type: 'water',
      title: 'Coconut Water Hydration',
      description_short: 'Cooling refreshment',
      description_detailed: null,
      balances_doshas: ['Pitta'],
      aggravates_doshas: ['Kapha'],
      best_for_season: 'summer',
      best_time_of_day: 'afternoon',
      helps_with_emotions: ['angry', 'frustrated', 'irritated'],
      duration_minutes: 5,
      difficulty: 'easy',
      steps: null,
      precautions: [],
      video_url: null,
      traditional_source: 'Ayurvedic nutrition',
      user_success_rate: 0.85,
      times_recommended: 180,
      avg_effectiveness: 4.1,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      knowledge_id: 'k-pitta-2',
      content_type: 'meditation',
      title: 'Cooling Moon Meditation',
      description_short: 'Calming visualization',
      description_detailed: null,
      balances_doshas: ['Pitta'],
      aggravates_doshas: [],
      best_for_season: 'any',
      best_time_of_day: 'evening',
      helps_with_emotions: ['angry', 'stressed'],
      duration_minutes: 15,
      difficulty: 'moderate',
      steps: null,
      precautions: [],
      video_url: null,
      traditional_source: 'Tantric practices',
      user_success_rate: 0.88,
      times_recommended: 220,
      avg_effectiveness: 4.4,
      created_at: '2024-01-01T00:00:00Z',
    },
  ];

  const kaphaKnowledge: KnowledgeRow[] = [
    {
      knowledge_id: 'k-kapha-1',
      content_type: 'exercise',
      title: 'Brisk Morning Walk',
      description_short: 'Energizing movement',
      description_detailed: null,
      balances_doshas: ['Kapha'],
      aggravates_doshas: ['Vata'],
      best_for_season: 'spring',
      best_time_of_day: 'morning',
      helps_with_emotions: ['tired', 'sluggish', 'depressed'],
      duration_minutes: 30,
      difficulty: 'easy',
      steps: null,
      precautions: [],
      video_url: null,
      traditional_source: 'Ayurvedic daily routine',
      user_success_rate: 0.90,
      times_recommended: 350,
      avg_effectiveness: 4.5,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      knowledge_id: 'k-kapha-2',
      content_type: 'breathing',
      title: 'Kapalabhati (Skull Shining Breath)',
      description_short: 'Energizing pranayama',
      description_detailed: null,
      balances_doshas: ['Kapha'],
      aggravates_doshas: ['Pitta'],
      best_for_season: 'any',
      best_time_of_day: 'morning',
      helps_with_emotions: ['tired', 'sluggish'],
      duration_minutes: 5,
      difficulty: 'moderate',
      steps: null,
      precautions: ['Avoid if pregnant', 'Avoid with high blood pressure'],
      video_url: null,
      traditional_source: 'Hatha Yoga Pradipika',
      user_success_rate: 0.86,
      times_recommended: 280,
      avg_effectiveness: 4.3,
      created_at: '2024-01-01T00:00:00Z',
    },
  ];

  describe('VATA dosha recommendations', () => {
    it('should provide grounding recommendations for anxious VATA user', () => {
      const recommendations = buildRecommendations(vataKnowledge, 'anxious', 'Vata');

      expect(recommendations).toHaveLength(2);
      
      // First recommendation (tea)
      expect(recommendations[0].title).toBe('Warm Ginger Tea');
      expect(recommendations[0].why).toContain('Warm herbal tea');
      expect(recommendations[0].why).toContain('ground');
      expect(recommendations[0].why).toContain('Vata');
      expect(recommendations[0].why).toContain('anxiety');

      // Second recommendation (breathing)
      expect(recommendations[1].title).toBe('Nadi Shodhana (Alternate Nostril Breathing)');
      expect(recommendations[1].why).toContain('breathing');
      expect(recommendations[1].why).toContain('Vata');
      expect(recommendations[1].why).toContain('anxiety');
    });

    it('should adapt explanation for different VATA emotions', () => {
      const worriedRecs = buildRecommendations(vataKnowledge, 'worried', 'Vata');
      const stressedRecs = buildRecommendations(vataKnowledge, 'stressed', 'Vata');

      expect(worriedRecs[0].why).toContain('worry');
      expect(stressedRecs[0].why).toContain('stress');
    });
  });

  describe('PITTA dosha recommendations', () => {
    it('should provide cooling recommendations for angry PITTA user', () => {
      const recommendations = buildRecommendations(pittaKnowledge, 'angry', 'Pitta');

      expect(recommendations).toHaveLength(2);
      
      // First recommendation (water)
      expect(recommendations[0].title).toBe('Coconut Water Hydration');
      expect(recommendations[0].why.toLowerCase()).toContain('cool');
      expect(recommendations[0].why).toContain('Pitta');
      expect(recommendations[0].why).toContain('anger');

      // Second recommendation (meditation)
      expect(recommendations[1].title).toBe('Cooling Moon Meditation');
      expect(recommendations[1].why.toLowerCase()).toContain('calm');
      expect(recommendations[1].why).toContain('Pitta');
      expect(recommendations[1].why).toContain('anger');
    });

    it('should adapt explanation for different PITTA emotions', () => {
      const frustratedRecs = buildRecommendations(pittaKnowledge, 'frustrated', 'Pitta');
      const irritatedRecs = buildRecommendations(pittaKnowledge, 'irritated', 'Pitta');

      expect(frustratedRecs[0].why).toContain('frustration');
      expect(irritatedRecs[0].why).toContain('irritation');
    });
  });

  describe('KAPHA dosha recommendations', () => {
    it('should provide energizing recommendations for tired KAPHA user', () => {
      const recommendations = buildRecommendations(kaphaKnowledge, 'tired', 'Kapha');

      expect(recommendations).toHaveLength(2);
      
      // First recommendation (exercise)
      expect(recommendations[0].title).toBe('Brisk Morning Walk');
      expect(recommendations[0].why.toLowerCase()).toContain('energy');
      expect(recommendations[0].why).toContain('Kapha');
      expect(recommendations[0].why).toContain('fatigue');

      // Second recommendation (breathing)
      expect(recommendations[1].title).toBe('Kapalabhati (Skull Shining Breath)');
      expect(recommendations[1].why.toLowerCase()).toContain('energiz');
      expect(recommendations[1].why).toContain('Kapha');
      expect(recommendations[1].why).toContain('fatigue');
    });

    it('should adapt explanation for different KAPHA emotions', () => {
      const sluggishRecs = buildRecommendations(kaphaKnowledge, 'sluggish', 'Kapha');
      const depressedRecs = buildRecommendations(kaphaKnowledge, 'depressed', 'Kapha');

      // Note: 'sluggish' doesn't have a direct mapping, so it uses 'current emotional state'
      expect(sluggishRecs[0].why).toContain('current emotional state');
      expect(depressedRecs[0].why).toContain('low mood');
    });
  });

  describe('Cross-dosha comparison', () => {
    it('should provide different explanations for same content type across doshas', () => {
      const vataBreathing = buildRecommendations([vataKnowledge[1]], 'anxious', 'Vata');
      const kaphaBreathing = buildRecommendations([kaphaKnowledge[1]], 'tired', 'Kapha');

      // Both are breathing exercises, but explanations should differ
      expect(vataBreathing[0].why).toContain('Vata');
      expect(vataBreathing[0].why.toLowerCase()).toContain('anchor');
      
      expect(kaphaBreathing[0].why).toContain('Kapha');
      expect(kaphaBreathing[0].why.toLowerCase()).toContain('energiz');
      
      // Ensure they're actually different
      expect(vataBreathing[0].why).not.toBe(kaphaBreathing[0].why);
    });
  });

  describe('Recommendation quality', () => {
    it('should provide actionable, personalized recommendations', () => {
      const recommendations = buildRecommendations(vataKnowledge, 'anxious', 'Vata');

      recommendations.forEach(rec => {
        // Should have all required fields
        expect(rec.knowledge_id).toBeTruthy();
        expect(rec.title).toBeTruthy();
        expect(rec.content_type).toBeTruthy();
        expect(rec.why).toBeTruthy();

        // Why explanation should be substantial
        expect(rec.why.length).toBeGreaterThan(50);

        // Should mention the dosha
        expect(rec.why).toContain('Vata');

        // Should be personalized (use "your")
        expect(rec.why.toLowerCase()).toContain('your');
      });
    });

    it('should maintain consistent structure across all doshas', () => {
      const vataRecs = buildRecommendations(vataKnowledge, 'anxious', 'Vata');
      const pittaRecs = buildRecommendations(pittaKnowledge, 'angry', 'Pitta');
      const kaphaRecs = buildRecommendations(kaphaKnowledge, 'tired', 'Kapha');

      [vataRecs, pittaRecs, kaphaRecs].forEach(recs => {
        recs.forEach(rec => {
          expect(rec).toHaveProperty('knowledge_id');
          expect(rec).toHaveProperty('title');
          expect(rec).toHaveProperty('content_type');
          expect(rec).toHaveProperty('duration_minutes');
          expect(rec).toHaveProperty('why');
        });
      });
    });
  });
});
