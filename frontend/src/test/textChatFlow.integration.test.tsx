/**
 * Integration Test: Complete Text Chat Flow
 * Feature: sama-chat-integration
 * 
 * Tests the complete text chat flow from user input to response display:
 * - User sends message → backend processes → frontend displays response
 * - Emotion badge appears with response
 * - Recommendations display correctly
 * - Session persistence across requests
 * 
 * Validates: Requirements 1.1, 1.3, 1.4, 5.2, 6.5, 10.4, 10.5
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from './mswServer';
import { renderWithProviders, setupLocalStorage, clearLocalStorage } from './testUtilities';
import TodaysWellness from '../pages/TodaysWellness';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

describe('Integration: Complete Text Chat Flow', () => {
  beforeEach(() => {
    clearLocalStorage();
    setupLocalStorage({
      token: 'test-jwt-token',
      userId: 'test-user-123'
    });
  });

  it('should complete full text chat flow: send message → process → display response', async () => {
    // Setup: Mock successful chat response
    server.use(
      http.post(`${API_BASE_URL}/api/chat/message`, async ({ request }) => {
        const body = await request.json() as any;
        
        return HttpResponse.json({
          success: true,
          data: {
            reply: `SAMA response to: ${body.message}`,
            emotion: {
              primary: 'joy',
              intensity: 0.8
            },
            recommendations: [
              {
                knowledge_id: 'rec-001',
                title: 'Morning Meditation',
                content_type: 'meditation',
                duration_minutes: 10,
                why: 'This will help you start your day with clarity'
              }
            ],
            is_crisis: false,
            meta: {
              session_id: 'session-001',
              message_id: 'msg-001'
            }
          }
        });
      })
    );

    // Render the chat component
    renderWithProviders(<TodaysWellness />);

    // User types a message
    const input = screen.getByPlaceholderText(/type your message/i);
    await userEvent.type(input, 'I feel great today!');

    // User submits the message
    const sendButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(sendButton);

    // Wait for the user message to appear
    await waitFor(() => {
      expect(screen.getByText('I feel great today!')).toBeInTheDocument();
    });

    // Wait for the AI response to appear
    await waitFor(() => {
      expect(screen.getByText(/SAMA response to: I feel great today!/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify emotion badge is displayed
    await waitFor(() => {
      expect(screen.getByText(/joy/i)).toBeInTheDocument();
    });

    // Verify recommendation card is displayed
    await waitFor(() => {
      expect(screen.getByText('Morning Meditation')).toBeInTheDocument();
      expect(screen.getByText(/This will help you start your day with clarity/i)).toBeInTheDocument();
    });

    // Verify session ID is stored in local storage
    expect(localStorage.getItem('sessionId')).toBe('session-001');
  });

  it('should persist session across multiple messages', async () => {
    let requestCount = 0;
    let receivedSessionId: string | null = null;

    // Setup: Track session ID across requests
    server.use(
      http.post(`${API_BASE_URL}/api/chat/message`, async ({ request }) => {
        const body = await request.json() as any;
        requestCount++;
        
        if (requestCount === 1) {
          // First request: create new session
          receivedSessionId = 'session-persistent-001';
        } else {
          // Subsequent requests: verify session ID is sent
          receivedSessionId = body.session_id || null;
        }

        return HttpResponse.json({
          success: true,
          data: {
            reply: `Response ${requestCount}`,
            emotion: { primary: 'neutral', intensity: 0.5 },
            recommendations: [],
            is_crisis: false,
            meta: {
              session_id: 'session-persistent-001',
              message_id: `msg-${requestCount}`
            }
          }
        });
      })
    );

    renderWithProviders(<TodaysWellness />);

    // Send first message
    const input = screen.getByPlaceholderText(/type your message/i);
    await userEvent.type(input, 'First message');
    const sendButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(sendButton);

    // Wait for first response
    await waitFor(() => {
      expect(screen.getByText('Response 1')).toBeInTheDocument();
    });

    // Verify session ID is stored
    expect(localStorage.getItem('sessionId')).toBe('session-persistent-001');

    // Send second message
    await userEvent.clear(input);
    await userEvent.type(input, 'Second message');
    await userEvent.click(sendButton);

    // Wait for second response
    await waitFor(() => {
      expect(screen.getByText('Response 2')).toBeInTheDocument();
    });

    // Verify session ID was sent in second request
    expect(receivedSessionId).toBe('session-persistent-001');
    expect(requestCount).toBe(2);
  });

  it('should display emotion badge with correct emotion and intensity', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/chat/message`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            reply: 'I understand you are feeling anxious.',
            emotion: {
              primary: 'anxiety',
              intensity: 0.75
            },
            recommendations: [],
            is_crisis: false,
            meta: {
              session_id: 'session-002',
              message_id: 'msg-002'
            }
          }
        });
      })
    );

    renderWithProviders(<TodaysWellness />);

    const input = screen.getByPlaceholderText(/type your message/i);
    await userEvent.type(input, 'I am worried about tomorrow');
    const sendButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(sendButton);

    // Wait for emotion badge
    await waitFor(() => {
      const emotionBadge = screen.getByText(/anxiety/i);
      expect(emotionBadge).toBeInTheDocument();
    });
  });

  it('should display multiple recommendation cards when provided', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/chat/message`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            reply: 'Here are some suggestions for you.',
            emotion: { primary: 'neutral', intensity: 0.5 },
            recommendations: [
              {
                knowledge_id: 'rec-001',
                title: 'Deep Breathing',
                content_type: 'breathing',
                duration_minutes: 5,
                why: 'Helps reduce stress'
              },
              {
                knowledge_id: 'rec-002',
                title: 'Warm Tea',
                content_type: 'nutrition',
                duration_minutes: null,
                why: 'Calming for Vata'
              },
              {
                knowledge_id: 'rec-003',
                title: 'Gentle Walk',
                content_type: 'movement',
                duration_minutes: 15,
                why: 'Grounding activity'
              }
            ],
            is_crisis: false,
            meta: {
              session_id: 'session-003',
              message_id: 'msg-003'
            }
          }
        });
      })
    );

    renderWithProviders(<TodaysWellness />);

    const input = screen.getByPlaceholderText(/type your message/i);
    await userEvent.type(input, 'What should I do?');
    const sendButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(sendButton);

    // Wait for all recommendation cards
    await waitFor(() => {
      expect(screen.getByText('Deep Breathing')).toBeInTheDocument();
      expect(screen.getByText('Warm Tea')).toBeInTheDocument();
      expect(screen.getByText('Gentle Walk')).toBeInTheDocument();
    });

    // Verify recommendation details
    expect(screen.getByText(/Helps reduce stress/i)).toBeInTheDocument();
    expect(screen.getByText(/Calming for Vata/i)).toBeInTheDocument();
    expect(screen.getByText(/Grounding activity/i)).toBeInTheDocument();
  });

  it('should load conversation history when session exists', async () => {
    // Setup: Pre-existing session in local storage
    setupLocalStorage({
      token: 'test-jwt-token',
      userId: 'test-user-123',
      sessionId: 'session-existing-001'
    });

    // Mock API to return conversation history
    server.use(
      http.get(`${API_BASE_URL}/api/chat/session`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            session_id: 'session-existing-001',
            messages: [
              {
                id: 'msg-old-1',
                role: 'user',
                content: 'Previous message',
                createdAt: Date.now() - 60000
              },
              {
                id: 'msg-old-2',
                role: 'assistant',
                content: 'Previous response',
                createdAt: Date.now() - 59000
              }
            ]
          }
        });
      })
    );

    renderWithProviders(<TodaysWellness />);

    // Wait for conversation history to load
    await waitFor(() => {
      expect(screen.getByText('Previous message')).toBeInTheDocument();
      expect(screen.getByText('Previous response')).toBeInTheDocument();
    });
  });

  it('should handle empty recommendations gracefully', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/chat/message`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            reply: 'Just listening to you.',
            emotion: { primary: 'neutral', intensity: 0.5 },
            recommendations: [],
            is_crisis: false,
            meta: {
              session_id: 'session-004',
              message_id: 'msg-004'
            }
          }
        });
      })
    );

    renderWithProviders(<TodaysWellness />);

    const input = screen.getByPlaceholderText(/type your message/i);
    await userEvent.type(input, 'I just want to talk');
    const sendButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(sendButton);

    // Wait for response
    await waitFor(() => {
      expect(screen.getByText('Just listening to you.')).toBeInTheDocument();
    });

    // Verify no recommendation cards are displayed
    expect(screen.queryByText(/recommendation/i)).not.toBeInTheDocument();
  });
});
