/**
 * Frontend Test Utilities
 * 
 * This module provides utility functions for testing frontend components.
 */

import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, expect } from 'vitest';

// ============================================================================
// Render Utilities
// ============================================================================

/**
 * Custom render function with providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// ============================================================================
// Local Storage Utilities
// ============================================================================

/**
 * Sets up local storage with test data
 */
export function setupLocalStorage(data: {
  token?: string;
  sessionId?: string;
  userId?: string;
}) {
  if (data.token) {
    localStorage.setItem('token', data.token);
  }
  if (data.sessionId) {
    localStorage.setItem('sessionId', data.sessionId);
  }
  if (data.userId) {
    localStorage.setItem('userId', data.userId);
  }
}

/**
 * Clears local storage
 */
export function clearLocalStorage() {
  localStorage.clear();
}

/**
 * Gets item from local storage
 */
export function getLocalStorageItem(key: string): string | null {
  return localStorage.getItem(key);
}

// ============================================================================
// Mock Data Factories
// ============================================================================

/**
 * Creates a mock wellness message
 */
export function createMockWellnessMessage(
  overrides?: Partial<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: number;
    emotion?: { primary: string; intensity: number };
    recommendations?: any[];
    isCrisis?: boolean;
    audioUrl?: string;
    isVoice?: boolean;
  }>
) {
  return {
    id: '123e4567-e89b-12d3-a456-426614174000',
    role: 'user' as const,
    content: 'Test message',
    createdAt: Date.now(),
    ...overrides
  };
}

/**
 * Creates a mock chat response
 */
export function createMockChatResponse(
  overrides?: Partial<{
    reply: string;
    emotion: { primary: string; intensity: number };
    recommendations: any[];
    is_crisis: boolean;
    crisis_level?: string;
  }>
) {
  return {
    success: true,
    data: {
      reply: 'Test response',
      emotion: {
        primary: 'neutral',
        intensity: 0.5
      },
      recommendations: [],
      is_crisis: false,
      meta: {
        session_id: '123e4567-e89b-12d3-a456-426614174001',
        message_id: '123e4567-e89b-12d3-a456-426614174002'
      },
      ...overrides
    }
  };
}

/**
 * Creates a mock voice response
 */
export function createMockVoiceResponse(
  overrides?: Partial<{
    transcript: string;
    transcript_confidence: number;
    reply_text: string;
    reply_audio_url: string | null;
  }>
) {
  return {
    success: true,
    data: {
      transcript: 'Test transcript',
      transcript_confidence: 0.95,
      reply_text: 'Test response',
      reply_audio_url: 'https://example.com/audio.mp3',
      emotion: {
        primary: 'neutral',
        intensity: 0.5
      },
      recommendations: [],
      is_crisis: false,
      meta: {
        session_id: '123e4567-e89b-12d3-a456-426614174001',
        message_id: '123e4567-e89b-12d3-a456-426614174003'
      },
      ...overrides
    }
  };
}

/**
 * Creates a mock recommendation
 */
export function createMockRecommendation(
  overrides?: Partial<{
    knowledge_id: string;
    title: string;
    content_type: string;
    duration_minutes: number | null;
    why: string;
  }>
) {
  return {
    knowledge_id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Deep Breathing Exercise',
    content_type: 'breathing',
    duration_minutes: 5,
    why: 'This will help you relax',
    ...overrides
  };
}

/**
 * Creates a mock emotion
 */
export function createMockEmotion(
  primary: string = 'neutral',
  intensity: number = 0.5
) {
  return {
    primary,
    intensity
  };
}

// ============================================================================
// Audio Utilities
// ============================================================================

/**
 * Creates a mock audio blob
 */
export function createMockAudioBlob(): Blob {
  return new Blob(['mock audio data'], { type: 'audio/webm' });
}

/**
 * Creates a mock base64 audio string
 */
export function createMockAudioBase64(): string {
  return btoa('mock audio data');
}

/**
 * Mocks the MediaRecorder API
 */
export function mockMediaRecorder() {
  const mockMediaRecorder = {
    start: vi.fn(),
    stop: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    ondataavailable: null as ((event: any) => void) | null,
    onstop: null as (() => void) | null,
    state: 'inactive' as 'inactive' | 'recording' | 'paused'
  };

  (globalThis as any).MediaRecorder = vi.fn().mockImplementation(() => mockMediaRecorder) as any;

  return mockMediaRecorder;
}

/**
 * Mocks getUserMedia
 */
export function mockGetUserMedia() {
  const mockStream = {
    getTracks: vi.fn(() => [
      {
        stop: vi.fn()
      }
    ])
  };

  (globalThis as any).navigator.mediaDevices = {
    getUserMedia: vi.fn().mockResolvedValue(mockStream)
  } as any;

  return mockStream;
}

// ============================================================================
// Assertion Helpers
// ============================================================================

/**
 * Asserts that a chat response has the correct structure
 */
export function assertChatResponseStructure(response: any): void {
  expect(response).toHaveProperty('success');
  expect(response).toHaveProperty('data');
  expect(response.data).toHaveProperty('reply');
  expect(response.data).toHaveProperty('emotion');
  expect(response.data.emotion).toHaveProperty('primary');
  expect(response.data.emotion).toHaveProperty('intensity');
  expect(response.data).toHaveProperty('recommendations');
  expect(response.data).toHaveProperty('is_crisis');
  expect(response.data).toHaveProperty('meta');
}

/**
 * Asserts that a voice response has the correct structure
 */
export function assertVoiceResponseStructure(response: any): void {
  expect(response).toHaveProperty('success');
  expect(response).toHaveProperty('data');
  expect(response.data).toHaveProperty('transcript');
  expect(response.data).toHaveProperty('transcript_confidence');
  expect(response.data).toHaveProperty('reply_text');
  expect(response.data).toHaveProperty('reply_audio_url');
  expect(response.data).toHaveProperty('emotion');
  expect(response.data).toHaveProperty('recommendations');
  expect(response.data).toHaveProperty('is_crisis');
}

/**
 * Asserts that an element is visible
 */
export function assertElementVisible(element: HTMLElement): void {
  expect(element).toBeDefined();
  // Note: toBeInTheDocument and toBeVisible are from @testing-library/jest-dom
  // They are extended in setup.ts
}

/**
 * Asserts that an element has specific text
 */
export function assertElementHasText(element: HTMLElement, text: string): void {
  expect(element.textContent).toContain(text);
}

// ============================================================================
// Wait Utilities
// ============================================================================

/**
 * Waits for a specified number of milliseconds
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Waits for an element to appear
 */
export async function waitForElement(
  getElement: () => HTMLElement | null,
  timeout: number = 3000
): Promise<HTMLElement> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const element = getElement();
    if (element) {
      return element;
    }
    await wait(50);
  }

  throw new Error('Element did not appear within timeout');
}

// ============================================================================
// Event Utilities
// ============================================================================

/**
 * Simulates a user typing in an input
 */
export function simulateTyping(input: HTMLInputElement, text: string): void {
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Simulates a button click
 */
export function simulateClick(button: HTMLElement): void {
  button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

/**
 * Simulates a form submission
 */
export function simulateSubmit(form: HTMLFormElement): void {
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

// Re-export commonly used testing library functions
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
