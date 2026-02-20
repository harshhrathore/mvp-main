import { SAMAPersonalityEngine, SAMAPromptParams } from '../services/samaPersonalityEngine';

describe('SAMAPersonalityEngine', () => {
  let engine: SAMAPersonalityEngine;

  beforeEach(() => {
    engine = new SAMAPersonalityEngine();
  });

  describe('detectMode', () => {
    it('should detect PSYCHOLOGIST_MODE for crisis keywords', () => {
      const crisisMessages = [
        'I feel hopeless',
        'I want to kill myself',
        'I am having a panic attack',
        'I feel worthless and depressed',
        'I have no reason to live'
      ];

      crisisMessages.forEach(message => {
        expect(engine.detectMode(message)).toBe('PSYCHOLOGIST_MODE');
      });
    });

    it('should detect FRIEND_MODE for normal messages', () => {
      const normalMessages = [
        'I am feeling a bit anxious today',
        'Can you help me relax?',
        'I had a great day!',
        'I am feeling tired',
        'What should I do to feel better?'
      ];

      normalMessages.forEach(message => {
        expect(engine.detectMode(message)).toBe('FRIEND_MODE');
      });
    });
  });

  describe('buildUserProfile', () => {
    it('should build user profile with nickname', () => {
      const preferences = {
        nickname: 'Alex',
        name: 'Alexander',
        language: 'English',
        emotional_attachment: 8
      };

      const profile = engine.buildUserProfile(preferences);

      expect(profile).toContain('Name: Alexander');
      expect(profile).toContain('Nickname: Alex');
      expect(profile).toContain('Language Preference: English');
      expect(profile).toContain('very warm and deeply empathetic');
      expect(profile).toContain('Emotional Attachment: 8/10');
    });

    it('should use "friend" as default nickname when not provided', () => {
      const preferences = {
        nickname: null,
        name: 'John',
        language: 'English',
        emotional_attachment: 5
      };

      const profile = engine.buildUserProfile(preferences);

      expect(profile).toContain('Nickname: friend');
    });

    it('should map emotional attachment to empathy levels correctly', () => {
      const testCases = [
        { attachment: 9, expected: 'very warm and deeply empathetic' },
        { attachment: 7, expected: 'caring and supportive' },
        { attachment: 5, expected: 'balanced and understanding' },
        { attachment: 3, expected: 'calm and gentle' }
      ];

      testCases.forEach(({ attachment, expected }) => {
        const preferences = {
          nickname: null,
          name: 'Test',
          language: 'English',
          emotional_attachment: attachment
        };

        const profile = engine.buildUserProfile(preferences);
        expect(profile).toContain(expected);
      });
    });
  });

  describe('buildDoshaContext', () => {
    it('should build dosha context with profile and vikriti', () => {
      const params: SAMAPromptParams = {
        userMessage: 'I feel anxious',
        emotion: { primary_emotion: 'anxiety', emotion_intensity: 7 },
        doshaProfile: {
          primary_dosha: 'Vata',
          prakriti_scores: { vata: 8, pitta: 5, kapha: 3 }
        },
        vikriti: {
          dominant: 'Vata',
          scores: { vata: 8, pitta: 4, kapha: 3 }
        },
        knowledge: [],
        history: [],
        userPreferences: {
          nickname: null,
          name: 'Test',
          language: 'English',
          emotional_attachment: 7
        },
        crossSessionContext: [],
        doshaHistory: {}
      };

      const context = engine.buildDoshaContext(params);

      expect(context).toContain('Dominant Dosha: Vata');
      expect(context).toContain('Intensity: 8/10');
      expect(context).toContain('Prakriti (constant): Vata');
      expect(context).toContain('Bikriti (latest): Vata');
    });

    it('should return empty string when no dosha data available', () => {
      const params: SAMAPromptParams = {
        userMessage: 'Hello',
        emotion: { primary_emotion: 'neutral', emotion_intensity: 5 },
        doshaProfile: null,
        vikriti: null,
        knowledge: [],
        history: [],
        userPreferences: {
          nickname: null,
          name: 'Test',
          language: 'English',
          emotional_attachment: 7
        },
        crossSessionContext: [],
        doshaHistory: {}
      };

      const context = engine.buildDoshaContext(params);

      expect(context).toBe('');
    });

    it('should include dosha history when provided', () => {
      const params: SAMAPromptParams = {
        userMessage: 'I feel anxious',
        emotion: { primary_emotion: 'anxiety', emotion_intensity: 7 },
        doshaProfile: {
          primary_dosha: 'Vata',
          prakriti_scores: { vata: 8, pitta: 5, kapha: 3 }
        },
        vikriti: null,
        knowledge: [],
        history: [],
        userPreferences: {
          nickname: null,
          name: 'Test',
          language: 'English',
          emotional_attachment: 7
        },
        crossSessionContext: [],
        doshaHistory: {
          today: { dosha: 'Vata', intensity: 7 },
          yesterday: { dosha: 'Pitta', intensity: 5 }
        }
      };

      const context = engine.buildDoshaContext(params);

      expect(context).toContain('Yesterday: Pitta (Intensity 5/10)');
      expect(context).toContain('Today: Vata (Intensity 7/10)');
    });
  });

  describe('buildConversationContext', () => {
    it('should build conversation context from history', () => {
      const history = [
        { role: 'user' as const, content: 'I am feeling anxious' },
        { role: 'assistant' as const, content: 'I hear you. What is making you anxious?' },
        { role: 'user' as const, content: 'Work stress' }
      ];

      const context = engine.buildConversationContext(history, []);

      expect(context).toContain('Current Session Context:');
      expect(context).toContain('User: I am feeling anxious');
      expect(context).toContain('SAMA: I hear you. What is making you anxious?');
      expect(context).toContain('User: Work stress');
    });

    it('should return empty string when no history', () => {
      const context = engine.buildConversationContext([], []);

      expect(context).toBe('');
    });
  });

  describe('buildSystemPrompt', () => {
    it('should build complete system prompt with all components', () => {
      const params: SAMAPromptParams = {
        userMessage: 'I am feeling anxious about work',
        emotion: { primary_emotion: 'anxiety', emotion_intensity: 7 },
        doshaProfile: {
          primary_dosha: 'Vata',
          prakriti_scores: { vata: 8, pitta: 5, kapha: 3 }
        },
        vikriti: {
          dominant: 'Vata',
          scores: { vata: 8, pitta: 4, kapha: 3 }
        },
        knowledge: [],
        history: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi! How are you?' }
        ],
        userPreferences: {
          nickname: 'Alex',
          name: 'Alexander',
          language: 'English',
          emotional_attachment: 8
        },
        crossSessionContext: [],
        doshaHistory: {}
      };

      const prompt = engine.buildSystemPrompt(params);

      // Check for system instructions
      expect(prompt).toContain('You are SAMA');
      expect(prompt).toContain('FRIEND MODE RULES');
      expect(prompt).toContain('AYURVEDIC SUGGESTIONS GUIDELINES');
      
      // Check for mode
      expect(prompt).toContain('REQUIRED RESPONSE MODE: FRIEND_MODE');
      
      // Check for user profile
      expect(prompt).toContain('Name: Alexander');
      expect(prompt).toContain('Nickname: Alex');
      
      // Check for dosha context
      expect(prompt).toContain('Dominant Dosha: Vata');
      
      // Check for conversation context
      expect(prompt).toContain('Current Session Context:');
      expect(prompt).toContain('User: Hello');
      
      // Check for user message
      expect(prompt).toContain('I am feeling anxious about work');
      
      // Check for 3-step logic
      expect(prompt).toContain('Step 1:');
      expect(prompt).toContain('Step 2:');
      expect(prompt).toContain('Step 3:');
    });

    it('should switch to PSYCHOLOGIST_MODE for crisis messages', () => {
      const params: SAMAPromptParams = {
        userMessage: 'I feel hopeless and want to end it all',
        emotion: { primary_emotion: 'despair', emotion_intensity: 10 },
        doshaProfile: null,
        vikriti: null,
        knowledge: [],
        history: [],
        userPreferences: {
          nickname: null,
          name: 'Test',
          language: 'English',
          emotional_attachment: 7
        },
        crossSessionContext: [],
        doshaHistory: {}
      };

      const prompt = engine.buildSystemPrompt(params);

      expect(prompt).toContain('REQUIRED RESPONSE MODE: PSYCHOLOGIST_MODE');
    });

    it('should include dosha-specific suggestions reference', () => {
      const params: SAMAPromptParams = {
        userMessage: 'Can you suggest something for my anxiety?',
        emotion: { primary_emotion: 'anxiety', emotion_intensity: 7 },
        doshaProfile: {
          primary_dosha: 'Pitta',
          prakriti_scores: { vata: 3, pitta: 8, kapha: 5 }
        },
        vikriti: null,
        knowledge: [],
        history: [],
        userPreferences: {
          nickname: null,
          name: 'Test',
          language: 'English',
          emotional_attachment: 7
        },
        crossSessionContext: [],
        doshaHistory: {}
      };

      const prompt = engine.buildSystemPrompt(params);

      expect(prompt).toContain('choose ONE from the Pitta list');
    });
  });
});
