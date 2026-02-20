/**
 * Mock Service Worker (MSW) Handlers
 * 
 * This module provides MSW request handlers for mocking API calls
 * during frontend testing.
 */

import { http, HttpResponse } from 'msw';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ============================================================================
// Chat API Handlers
// ============================================================================

/**
 * Mock handler for text chat endpoint
 */
export const chatMessageHandler = http.post(
  `${API_BASE_URL}/api/chat/message`,
  async ({ request }) => {
    const body = await request.json() as any;

    // Simulate successful chat response
    return HttpResponse.json({
      success: true,
      data: {
        reply: `Mock response to: ${body.message}`,
        emotion: {
          primary: 'neutral',
          intensity: 0.5
        },
        recommendations: [
          {
            knowledge_id: '123e4567-e89b-12d3-a456-426614174000',
            title: 'Deep Breathing Exercise',
            content_type: 'breathing',
            duration_minutes: 5,
            why: 'This will help you relax'
          }
        ],
        is_crisis: false,
        meta: {
          session_id: '123e4567-e89b-12d3-a456-426614174001',
          message_id: '123e4567-e89b-12d3-a456-426614174002'
        }
      }
    });
  }
);

/**
 * Mock handler for voice chat endpoint
 */
export const voiceChatHandler = http.post(
  `${API_BASE_URL}/api/voice/chat`,
  async ({ request }) => {
    const body = await request.json() as any;

    // Simulate successful voice response
    return HttpResponse.json({
      success: true,
      data: {
        transcript: 'Mock transcript of audio',
        transcript_confidence: 0.95,
        reply_text: 'Mock voice response',
        reply_audio_url: 'https://example.com/audio/response.mp3',
        emotion: {
          primary: 'calm',
          intensity: 0.7
        },
        recommendations: [],
        is_crisis: false,
        meta: {
          session_id: '123e4567-e89b-12d3-a456-426614174001',
          message_id: '123e4567-e89b-12d3-a456-426614174003'
        }
      }
    });
  }
);

// ============================================================================
// Session API Handlers
// ============================================================================

/**
 * Mock handler for getting session
 */
export const getSessionHandler = http.get(
  `${API_BASE_URL}/api/chat/session`,
  () => {
    return HttpResponse.json({
      success: true,
      data: {
        session_id: '123e4567-e89b-12d3-a456-426614174001',
        started_at: new Date().toISOString(),
        type: 'regular'
      }
    });
  }
);

/**
 * Mock handler for ending session
 */
export const endSessionHandler = http.post(
  `${API_BASE_URL}/api/chat/session/end`,
  () => {
    return HttpResponse.json({
      success: true,
      message: 'Session ended successfully'
    });
  }
);

// ============================================================================
// Error Handlers
// ============================================================================

/**
 * Mock handler for authentication error
 */
export const authErrorHandler = http.post(
  `${API_BASE_URL}/api/chat/message`,
  () => {
    return HttpResponse.json(
      {
        success: false,
        error: 'Unauthorized'
      },
      { status: 401 }
    );
  }
);

/**
 * Mock handler for network error
 */
export const networkErrorHandler = http.post(
  `${API_BASE_URL}/api/chat/message`,
  () => {
    return HttpResponse.error();
  }
);

/**
 * Mock handler for server error
 */
export const serverErrorHandler = http.post(
  `${API_BASE_URL}/api/chat/message`,
  () => {
    return HttpResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
);

/**
 * Mock handler for validation error
 */
export const validationErrorHandler = http.post(
  `${API_BASE_URL}/api/chat/message`,
  () => {
    return HttpResponse.json(
      {
        success: false,
        error: 'Message is required and must be less than 2000 characters'
      },
      { status: 400 }
    );
  }
);

/**
 * Mock handler for crisis response
 */
export const crisisResponseHandler = http.post(
  `${API_BASE_URL}/api/chat/message`,
  async ({ request }) => {
    const body = await request.json() as any;

    return HttpResponse.json({
      success: true,
      data: {
        reply: 'I hear that you are going through a difficult time. Your safety is important.',
        emotion: {
          primary: 'sadness',
          intensity: 0.9
        },
        recommendations: [],
        is_crisis: true,
        crisis_level: 'high',
        meta: {
          session_id: '123e4567-e89b-12d3-a456-426614174001',
          message_id: '123e4567-e89b-12d3-a456-426614174004'
        }
      }
    });
  }
);

// ============================================================================
// Default Handlers
// ============================================================================

/**
 * Default MSW handlers for testing
 */
export const defaultHandlers = [
  chatMessageHandler,
  voiceChatHandler,
  getSessionHandler,
  endSessionHandler
];

/**
 * Error scenario handlers
 */
export const errorHandlers = {
  auth: authErrorHandler,
  network: networkErrorHandler,
  server: serverErrorHandler,
  validation: validationErrorHandler
};

/**
 * Special scenario handlers
 */
export const scenarioHandlers = {
  crisis: crisisResponseHandler
};
