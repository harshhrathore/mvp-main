/**
 * Property-Based Testing Generators for Frontend
 * 
 * This module provides fast-check generators for creating random test data
 * for the SAMA Chat Integration feature (frontend).
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
  fc.constant('Life is not worth living anymore')
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

// ============================================================================
// Audio Generators
// ============================================================================

/**
 * Generates base64 audio string (mock)
 */
export const audioBase64Arbitrary = fc.string({ minLength: 100, maxLength: 1000 })
  .map(s => btoa(s));

/**
 * Generates audio URL
 */
export const audioUrlArbitrary = fc.webUrl();

/**
 * Generates transcript confidence (0-1)
 */
export const transcriptConfidenceArbitrary = fc.double({ min: 0, max: 1, noNaN: true });

// ============================================================================
// API Response Generators
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
    crisis_level: fc.option(fc.constantFrom('low', 'medium', 'high'), { nil: undefined }),
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
// Error Response Generators
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

// ============================================================================
// UI State Generators
// ============================================================================

/**
 * Generates voice recording state
 */
export const voiceRecordingStateArbitrary = fc.record({
  isRecording: fc.boolean(),
  isPaused: fc.boolean(),
  duration: fc.integer({ min: 0, max: 300 }),
  audioLevel: fc.double({ min: 0, max: 1 })
});

/**
 * Generates loading state
 */
export const loadingStateArbitrary = fc.boolean();

/**
 * Generates error state
 */
export const errorStateArbitrary = fc.option(errorMessageArbitrary, { nil: null });

// ============================================================================
// Message Display Generators
// ============================================================================

/**
 * Generates wellness message for display
 */
export const wellnessMessageArbitrary = fc.record({
  id: uuidArbitrary,
  role: fc.constantFrom('user', 'assistant') as fc.Arbitrary<'user' | 'assistant'>,
  content: fc.string({ minLength: 1, maxLength: 500 }),
  createdAt: fc.integer({ min: Date.now() - 86400000, max: Date.now() }),
  emotion: fc.option(emotionArbitrary, { nil: undefined }),
  recommendations: fc.option(recommendationsArbitrary, { nil: undefined }),
  isCrisis: fc.option(fc.boolean(), { nil: undefined }),
  audioUrl: fc.option(audioUrlArbitrary, { nil: undefined }),
  isVoice: fc.option(fc.boolean(), { nil: undefined })
});

/**
 * Generates array of wellness messages
 */
export const wellnessMessagesArbitrary = fc.array(
  wellnessMessageArbitrary,
  { minLength: 0, maxLength: 20 }
);

// ============================================================================
// Local Storage Generators
// ============================================================================

/**
 * Generates JWT token (mock)
 */
export const jwtTokenArbitrary = fc.string({ minLength: 50, maxLength: 200 })
  .map(s => `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(s)}.${btoa(s.slice(0, 20))}`);

/**
 * Generates local storage data
 */
export const localStorageDataArbitrary = fc.record({
  token: fc.option(jwtTokenArbitrary, { nil: null }),
  sessionId: fc.option(sessionIdArbitrary, { nil: null }),
  userId: fc.option(uuidArbitrary, { nil: null })
});

// ============================================================================
// Network State Generators
// ============================================================================

/**
 * Generates network error
 */
export const networkErrorArbitrary = fc.oneof(
  fc.constant(new Error('Network request failed')),
  fc.constant(new Error('Failed to fetch')),
  fc.constant(new Error('Connection timeout'))
);

/**
 * Generates fetch response
 */
export const fetchResponseArbitrary = (bodyArbitrary: fc.Arbitrary<any>) =>
  fc.record({
    ok: fc.boolean(),
    status: httpStatusCodeArbitrary,
    statusText: fc.string({ minLength: 2, maxLength: 50 }),
    json: fc.constant(async () => bodyArbitrary)
  });
