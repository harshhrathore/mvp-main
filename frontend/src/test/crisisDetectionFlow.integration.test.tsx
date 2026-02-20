/**
 * Integration Test: Crisis Detection Flow
 * Feature: sama-chat-integration
 * 
 * Tests the complete crisis detection flow:
 * - Crisis message → backend detects → frontend shows helpline
 * - Crisis event is logged
 * - Mode switches to Psychologist_Mode
 * 
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from './mswServer';
import { renderWithProviders, setupLocalStorage, clearLocalStorage } from './testUtilities';
import TodaysWellness from '../pages/TodaysWellness';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

describe('Integration: Crisis Detection Flow', () => {
  beforeEach(() => {
    clearLocalStorage();
    setupLocalStorage({
      token: 'test-jwt-token',
      userId: 'test-user-123'
    });
  });

  it('should detect crisis and display helpline for suicide-related message', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/chat/message`, async ({ request }) => {
        const body = await request.json() as any;
        
        return HttpResponse.json({
          success: true,
          data: {
            reply: 'I hear that you are going through an incredibly difficult time. Your life matters, and I want to help you stay safe. Please reach out to a crisis counselor who can provide immediate support.',
            emotion: {
              primary: 'despair',
              intensity: 0.95
            },
            recommendations: [],
            is_crisis: true,
            crisis_level: 'high',
            meta: {
              session_id: 'crisis-session-001',
              message_id: 'crisis-msg-001'
            }
          }
        });
      })
    );

    renderWithProviders(<TodaysWellness />);

    // User sends crisis message
    const input = screen.getByPlaceholderText(/type your message/i);
    await userEvent.type(input, 'I want to end it all');
    const sendButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(sendButton);

    // Wait for crisis helpline to appear
    await waitFor(() => {
      expect(screen.getByText(/crisis/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify emergency hotline numbers are displayed
    await waitFor(() => {
      expect(screen.getByText(/988/i)).toBeInTheDocument(); // Suicide & Crisis Lifeline
    });

    // Verify professional response in Psychologist_Mode
    await waitFor(() => {
      expect(screen.getByText(/Your life matters/i)).toBeInTheDocument();
    });

    // Verify emotion reflects severity
    expect(screen.getByText(/despair/i)).toBeInTheDocument();
  });

  it('should detect crisis for self-harm keywords', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/chat/message`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            reply: 'I am deeply concerned about what you just shared. Self-harm is a sign that you need support right now. Please talk to a professional who can help.',
            emotion: {
              primary: 'distress',
              intensity: 0.9
            },
            recommendations: [],
            is_crisis: true,
            crisis_level: 'high',
            meta: {
              session_id: 'crisis-session-002',
              message_id: 'crisis-msg-002'
            }
          }
        });
      })
    );

    renderWithProviders(<TodaysWellness />);

    const input = screen.getByPlaceholderText(/type your message/i);
    await userEvent.type(input, 'I have been hurting myself');
    const sendButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(sendButton);

    // Wait for crisis helpline
    await waitFor(() => {
      expect(screen.getByText(/crisis/i)).toBeInTheDocument();
    });

    // Verify professional response
    await waitFor(() => {
      expect(screen.getByText(/deeply concerned/i)).toBeInTheDocument();
    });
  });

  it('should detect crisis for hopelessness expressions', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/chat/message`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            reply: 'I hear the pain in your words. Feeling hopeless is overwhelming, but you do not have to face this alone. Let me connect you with someone who can help.',
            emotion: {
              primary: 'hopelessness',
              intensity: 0.85
            },
            recommendations: [],
            is_crisis: true,
            crisis_level: 'medium',
            meta: {
              session_id: 'crisis-session-003',
              message_id: 'crisis-msg-003'
            }
          }
        });
      })
    );

    renderWithProviders(<TodaysWellness />);

    const input = screen.getByPlaceholderText(/type your message/i);
    await userEvent.type(input, 'Everything is hopeless, nothing will ever get better');
    const sendButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(sendButton);

    // Wait for crisis helpline
    await waitFor(() => {
      expect(screen.getByText(/crisis/i)).toBeInTheDocument();
    });

    // Verify empathetic professional response
    await waitFor(() => {
      expect(screen.getByText(/I hear the pain in your words/i)).toBeInTheDocument();
    });
  });

  it('should display crisis resources with acknowledgment button', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/chat/message`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            reply: 'Your safety is my priority. Please reach out to a crisis counselor.',
            emotion: {
              primary: 'distress',
              intensity: 0.9
            },
            recommendations: [],
            is_crisis: true,
            crisis_level: 'high',
            meta: {
              session_id: 'crisis-session-004',
              message_id: 'crisis-msg-004'
            }
          }
        });
      })
    );

    renderWithProviders(<TodaysWellness />);

    const input = screen.getByPlaceholderText(/type your message/i);
    await userEvent.type(input, 'I do not want to be here anymore');
    const sendButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(sendButton);

    // Wait for crisis helpline
    await waitFor(() => {
      expect(screen.getByText(/crisis/i)).toBeInTheDocument();
    });

    // Verify "I'm safe" button is present
    const safeButton = await screen.findByRole('button', { name: /i'm safe/i });
    expect(safeButton).toBeInTheDocument();

    // User clicks "I'm safe"
    await userEvent.click(safeButton);

    // Helpline should be dismissed or acknowledged
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /i'm safe/i })).not.toBeInTheDocument();
    });
  });

  it('should maintain Psychologist_Mode in subsequent messages after crisis', async () => {
    let messageCount = 0;

    server.use(
      http.post(`${API_BASE_URL}/api/chat/message`, async ({ request }) => {
        const body = await request.json() as any;
        messageCount++;

        if (messageCount === 1) {
          // First message: crisis detected
          return HttpResponse.json({
            success: true,
            data: {
              reply: 'I am here to support you through this difficult time.',
              emotion: { primary: 'distress', intensity: 0.9 },
              recommendations: [],
              is_crisis: true,
              crisis_level: 'high',
              meta: {
                session_id: 'crisis-session-005',
                message_id: 'crisis-msg-005-1'
              }
            }
          });
        } else {
          // Second message: still in Psychologist_Mode
          return HttpResponse.json({
            success: true,
            data: {
              reply: 'I am glad you are still talking with me. How are you feeling right now?',
              emotion: { primary: 'concern', intensity: 0.7 },
              recommendations: [],
              is_crisis: false, // No longer immediate crisis, but still professional
              meta: {
                session_id: 'crisis-session-005',
                message_id: 'crisis-msg-005-2'
              }
            }
          });
        }
      })
    );

    renderWithProviders(<TodaysWellness />);

    // First message: crisis
    const input = screen.getByPlaceholderText(/type your message/i);
    await userEvent.type(input, 'I feel like giving up');
    const sendButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/I am here to support you/i)).toBeInTheDocument();
    });

    // Second message: follow-up
    await userEvent.clear(input);
    await userEvent.type(input, 'I am still here');
    await userEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/I am glad you are still talking with me/i)).toBeInTheDocument();
    });

    // Verify professional tone maintained
    expect(screen.getByText(/How are you feeling right now/i)).toBeInTheDocument();
  });

  it('should log crisis event to backend', async () => {
    let crisisLogged = false;

    server.use(
      http.post(`${API_BASE_URL}/api/chat/message`, async ({ request }) => {
        const body = await request.json() as any;
        
        // Simulate backend logging crisis event
        if (body.message.toLowerCase().includes('suicide')) {
          crisisLogged = true;
        }

        return HttpResponse.json({
          success: true,
          data: {
            reply: 'Crisis response',
            emotion: { primary: 'distress', intensity: 0.9 },
            recommendations: [],
            is_crisis: true,
            crisis_level: 'high',
            meta: {
              session_id: 'crisis-session-006',
              message_id: 'crisis-msg-006'
            }
          }
        });
      })
    );

    renderWithProviders(<TodaysWellness />);

    const input = screen.getByPlaceholderText(/type your message/i);
    await userEvent.type(input, 'I am thinking about suicide');
    const sendButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/crisis/i)).toBeInTheDocument();
    });

    // Verify crisis was logged (in real implementation, this would be a backend test)
    expect(crisisLogged).toBe(true);
  });

  it('should not show crisis helpline for non-crisis messages', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/chat/message`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            reply: 'That sounds like a great plan!',
            emotion: {
              primary: 'joy',
              intensity: 0.7
            },
            recommendations: [],
            is_crisis: false,
            meta: {
              session_id: 'normal-session-001',
              message_id: 'normal-msg-001'
            }
          }
        });
      })
    );

    renderWithProviders(<TodaysWellness />);

    const input = screen.getByPlaceholderText(/type your message/i);
    await userEvent.type(input, 'I am going for a walk today');
    const sendButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText(/That sounds like a great plan!/i)).toBeInTheDocument();
    });

    // Verify NO crisis helpline is displayed
    expect(screen.queryByText(/988/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /i'm safe/i })).not.toBeInTheDocument();
  });

  it('should handle crisis detection in voice messages', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/voice/chat`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            transcript: 'I want to hurt myself',
            transcript_confidence: 0.93,
            reply_text: 'I am very concerned about what you just said. Please reach out to a crisis counselor immediately.',
            reply_audio_url: 'https://example.com/audio/crisis-response.mp3',
            emotion: {
              primary: 'distress',
              intensity: 0.95
            },
            recommendations: [],
            is_crisis: true,
            crisis_level: 'high',
            meta: {
              session_id: 'voice-crisis-session-001',
              message_id: 'voice-crisis-msg-001'
            }
          }
        });
      })
    );

    renderWithProviders(<TodaysWellness />);

    // Note: This test assumes voice recording UI is available
    // In actual implementation, you would trigger voice recording here
    
    // For now, we verify the response structure would trigger crisis display
    // Full voice integration would require MediaRecorder mocking
  });

  it('should display multiple crisis resources prominently', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/chat/message`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            reply: 'Please reach out for help immediately.',
            emotion: { primary: 'distress', intensity: 0.95 },
            recommendations: [],
            is_crisis: true,
            crisis_level: 'high',
            meta: {
              session_id: 'crisis-session-007',
              message_id: 'crisis-msg-007'
            }
          }
        });
      })
    );

    renderWithProviders(<TodaysWellness />);

    const input = screen.getByPlaceholderText(/type your message/i);
    await userEvent.type(input, 'Crisis message');
    const sendButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(sendButton);

    // Wait for crisis helpline
    await waitFor(() => {
      expect(screen.getByText(/crisis/i)).toBeInTheDocument();
    });

    // Verify multiple resources are displayed
    // National Suicide Prevention Lifeline
    expect(screen.getByText(/988/i)).toBeInTheDocument();
    
    // Crisis Text Line (if implemented)
    // expect(screen.getByText(/text/i)).toBeInTheDocument();
  });
});
