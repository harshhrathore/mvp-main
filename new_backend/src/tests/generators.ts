/**
 * Property-Based Testing Generators
 * 
 * This module provides fast-check generators for creating random test data
 * for the SAMA Chat Integration feature.
 */

import * as fc from 'fast-check';

// ============================================================================
// Message Generators
// ============================================================================

/**
 * Generates random chat messages (1-2000 characters)
 */
export const messageArbitrary = fc.string({ minLength: 1, maxLength: 2000 });

/**
 * Generates random short messages (1-100 characters)
 */
export const shortMessageArbitrary = fc.string({ minLength: 1, maxLength: 100 });

/**
 * Generates messages with crisis keywords
 */
export const crisisMessageArbitrary = fc.oneof(
  fc.constant('I want to end it all'),
  fc.constant('I am thinking about suicide'),
  fc.constant('I want to hurt myself'),
  fc.constant('I feel hopeless and want to die'),
  fc.constant('Life is not worth living anymore'),
  fc.string({ minLength: 10, maxLength: 100 }).map(s => `${s} suicide ${s}`),
  fc.string({ minLength: 10, maxLength: 100 }).map(s => `${s} self-harm ${s}`)
);

/**
 * Generates messages requesting suggestions
 */
export const suggestionRequestArbitrary = fc.oneof(
  fc.constant('Can you suggest something?'),
  fc.constant('What should I do?'),
  fc.constant('Give me some advice'),
  fc.constant('I need recommendations'),
  fc.constant('Help me with suggestions')
);

/**
 * Generates messages rejecting suggestions
 */
export const suggestionRejectionArbitrary = fc.oneof(
  fc.constant('I just want to talk'),
  fc.constant('I do not want advice'),
  fc.constant('Just listen to me'),
  fc.constant('No suggestions please'),
  fc.constant('I need to vent')
);

// ============================================================================
// Emotion Generators
// ============================================================================

/**
 * Valid emotion types
 */
export const emotionTypes = [
  'joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust',
  'neutral', 'anxious', 'calm', 'excited', 'frustrated'
] as const;

export type EmotionType = typeof emotionTypes[number];

/**
 * Generates random emotion type
 */
export const emotionTypeArbitrary = fc.constantFrom(...emotionTypes);

/**
 * Generates emotion intensity (0-1)
 */
export const emotionIntensityArbitrary = fc.double({ min: 0, max: 1, noNaN: true });

/**
 * Generates complete emotion object
 */
export const emotionArbitrary = fc.record({
  primary: emotionTypeArbitrary,
  intensity: emotionIntensityArbitrary
});

/**
 * Generates emotion with multiple detected emotions
 */
export const multiEmotionArbitrary = fc.record({
  emotions: fc.array(
    fc.record({
      emotion: emotionTypeArbitrary,
      confidence: fc.double({ min: 0, max: 1 })
    }),
    { minLength: 2, maxLength: 5 }
  )
});

// ============================================================================
// Dosha Generators
// ============================================================================

/**
 * Valid dosha types
 */
export const doshaTypes = ['VATA', 'PITTA', 'KAPHA'] as const;

export type DoshaType = typeof doshaTypes[number];

/**
 * Generates random dosha type
 */
export const doshaTypeArbitrary = fc.constantFrom(...doshaTypes);

/**
 * Generates dosha scores (0-100)
 */
export const doshaScoresArbitrary = fc.record({
  VATA: fc.integer({ min: 0, max: 100 }),
  PITTA: fc.integer({ min: 0, max: 100 }),
  KAPHA: fc.integer({ min: 0, max: 100 })
});

/**
 * Generates complete dosha profile
 */
export const doshaProfileArbitrary = fc.record({
  primary_dosha: doshaTypeArbitrary,
  prakriti_scores: doshaScoresArbitrary
});

/**
 * Generates vikriti (current imbalance) data
 */
export const vikritiArbitrary = fc.record({
  dominant: doshaTypeArbitrary,
  scores: doshaScoresArbitrary
});

// ============================================================================
// User Preference Generators
// ============================================================================

/**
 * Generates random nickname (3-20 characters)
 */
export const nicknameArbitrary = fc.string({ 
  minLength: 3, 
  maxLength: 20,
  unit: fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z')
});

/**
 * Generates voice gender preference
 */
export const voiceGenderArbitrary = fc.constantFrom('male', 'female');

/**
 * Generates emotional attachment level (1-10)
 */
export const emotionalAttachmentArbitrary = fc.integer({ min: 1, max: 10 });

/**
 * Generates language code
 */
export const languageArbitrary = fc.constantFrom('en', 'es', 'fr', 'de', 'hi');

/**
 * Generates complete user preferences
 */
export const userPreferencesArbitrary = fc.record({
  nickname: fc.option(nicknameArbitrary, { nil: null }),
  voice_gender: fc.option(voiceGenderArbitrary, { nil: null }),
  emotional_attachment: emotionalAttachmentArbitrary,
  preferred_language: languageArbitrary
});

// ============================================================================
// Recommendation Generators
// ============================================================================

/**
 * Valid content types
 */
export const contentTypes = ['meditation', 'breathing', 'yoga', 'music', 'article', 'video'] as const;

export type ContentType = typeof contentTypes[number];

/**
 * Generates content type
 */
export const contentTypeArbitrary = fc.constantFrom(...contentTypes);

/**
 * Generates recommendation
 */
export const recommendationArbitrary = fc.record({
  knowledge_id: fc.uuid(),
  title: fc.string({ minLength: 5, maxLength: 100 }),
  content_type: contentTypeArbitrary,
  duration_minutes: fc.option(fc.integer({ min: 1, max: 60 }), { nil: null }),
  why: fc.string({ minLength: 10, maxLength: 200 })
});

/**
 * Generates array of recommendations
 */
export const recommendationsArbitrary = fc.array(recommendationArbitrary, { minLength: 0, maxLength: 5 });

// ============================================================================
// Session Generators
// ============================================================================

/**
 * Generates UUID v4
 */
export const uuidArbitrary = fc.uuid();

/**
 * Generates session ID
 */
export const sessionIdArbitrary = uuidArbitrary;

/**
 * Generates message ID
 */
export const messageIdArbitrary = uuidArbitrary;

/**
 * Generates user ID
 */
export const userIdArbitrary = uuidArbitrary;

// ============================================================================
// Audio Generators
// ============================================================================

/**
 * Generates base64 audio string (mock)
 */
export const audioBase64Arbitrary = fc.string({ minLength: 100, maxLength: 1000 })
  .map(s => Buffer.from(s).toString('base64'));

/**
 * Generates audio URL
 */
export const audioUrlArbitrary = fc.webUrl();

/**
 * Generates transcript confidence (0-1)
 */
export const transcriptConfidenceArbitrary = fc.double({ min: 0, max: 1 });

// ============================================================================
// Response Generators
// ============================================================================

/**
 * Generates chat response structure
 */
export const chatResponseArbitrary = fc.record({
  success: fc.constant(true),
  data: fc.record({
    reply: fc.string({ minLength: 10, maxLength: 500 }),
    emotion: emotionArbitrary,
    recommendations: recommendationsArbitrary,
    is_crisis: fc.boolean(),
    meta: fc.record({
      session_id: sessionIdArbitrary,
      message_id: messageIdArbitrary
    })
  })
});

/**
 * Generates voice response structure
 */
export const voiceResponseArbitrary = fc.record({
  success: fc.constant(true),
  data: fc.record({
    transcript: fc.string({ minLength: 1, maxLength: 2000 }),
    transcript_confidence: transcriptConfidenceArbitrary,
    reply_text: fc.string({ minLength: 10, maxLength: 500 }),
    reply_audio_url: fc.option(audioUrlArbitrary, { nil: null }),
    emotion: emotionArbitrary,
    recommendations: recommendationsArbitrary,
    is_crisis: fc.boolean(),
    meta: fc.record({
      session_id: sessionIdArbitrary,
      message_id: messageIdArbitrary
    })
  })
});

// ============================================================================
// Conversation History Generators
// ============================================================================

/**
 * Generates conversation message
 */
export const conversationMessageArbitrary = fc.record({
  role: fc.constantFrom('user', 'assistant') as fc.Arbitrary<'user' | 'assistant'>,
  content: fc.string({ minLength: 1, maxLength: 500 }),
  timestamp: fc.date({ min: new Date('2024-01-01'), max: new Date() })
});

/**
 * Generates conversation history
 */
export const conversationHistoryArbitrary = fc.array(
  conversationMessageArbitrary,
  { minLength: 0, maxLength: 20 }
);

// ============================================================================
// Error Generators
// ============================================================================

/**
 * Generates HTTP status codes
 */
export const httpStatusCodeArbitrary = fc.constantFrom(200, 400, 401, 403, 404, 500, 503);

/**
 * Generates error messages
 */
export const errorMessageArbitrary = fc.string({ minLength: 10, maxLength: 200 });

/**
 * Generates API error response
 */
export const apiErrorArbitrary = fc.record({
  success: fc.constant(false),
  error: errorMessageArbitrary,
  statusCode: fc.constantFrom(400, 401, 403, 404, 500, 503)
});
