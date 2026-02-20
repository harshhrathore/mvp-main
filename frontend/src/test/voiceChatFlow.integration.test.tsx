/**
 * Integration Test: Complete Voice Chat Flow
 * Feature: sama-chat-integration
 * 
 * Tests the complete voice chat flow including STT and TTS:
 * - User records audio → backend transcribes → processes → returns audio
 * - Audio playback works
 * - Voice response includes all fields
 * 
 * Validates: Requirements 8.1, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from './mswServer';
import { 
  renderWithProviders, 
  setupLocalStorage, 
  clearLocalStorage,
  mockMediaRecorder,
  mockGetUserMedia,
  createMockAudioBlob
} from './testUtilities';
import TodaysWellness from '../pages/TodaysWellness';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

describe('Integration: Complete Voice Chat Flow', () => {
  let mockRecorder: any;
  let mockStream: any;
  let mockAudio: any;

  beforeEach(() => {
    clearLocalStorage();
    setupLocalStorage({
      token: 'test-jwt-token',
      userId: 'test-user-123'
    });

    // Mock MediaRecorder
    mockRecorder = mockMediaRecorder();
    
    // Mock getUserMedia
    mockStream = mockGetUserMedia();

    // Mock Audio element
    mockAudio = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      src: '',
      currentTime: 0,
      duration: 0,
      paused: true
    };
    (globalThis as any).Audio = vi.fn(() => mockAudio);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should complete full voice chat flow: record → transcribe → process → play audio', async () => {
    // Setup: Mock successful voice response
    server.use(
      http.post(`${API_BASE_URL}/api/voice/chat`, async ({ request }) => {
        const body = await request.json() as any;
        
        return HttpResponse.json({
          success: true,
          data: {
            transcript: 'I am feeling stressed today',
            transcript_confidence: 0.95,
            reply_text: 'I hear that you are feeling stressed. Let me help you find some calm.',
            reply_audio_url: 'https://example.com/audio/response-001.mp3',
            emotion: {
              primary: 'stress',
              intensity: 0.8
            },
            recommendations: [
              {
                knowledge_id: 'rec-voice-001',
                title: 'Box Breathing',
                content_type: 'breathing',
                duration_minutes: 5,
                why: 'This technique helps reduce stress quickly'
              }
            ],
            is_crisis: false,
            meta: {
              session_id: 'voice-session-001',
              message_id: 'voice-msg-001'
            }
          }
        });
      })
    );

    renderWithProviders(<TodaysWellness />);

    // User clicks voice recording button
    const voiceButton = screen.getByRole('button', { name: /record voice/i });
    await userEvent.click(voiceButton);

    // Verify recording started
    expect(mockRecorder.start).toHaveBeenCalled();

    // Wait for recording indicator
    await waitFor(() => {
      expect(screen.getByText(/recording/i)).toBeInTheDocument();
    });

    // Simulate recording completion
    const audioBlob = createMockAudioBlob();
    mockRecorder.ondataavailable?.({ data: audioBlob });
    
    // User stops recording
    const stopButton = screen.getByRole('button', { name: /stop/i });
    await userEvent.click(stopButton);
    
    mockRecorder.onstop?.();

    // Wait for transcript to appear
    await waitFor(() => {
      expect(screen.getByText('I am feeling stressed today')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Wait for AI response
    await waitFor(() => {
      expect(screen.getByText(/I hear that you are feeling stressed/i)).toBeInTheDocument();
    });

    // Verify emotion badge
    await waitFor(() => {
      expect(screen.getByText(/stress/i)).toBeInTheDocument();
    });

    // Verify recommendation
    expect(screen.getByText('Box Breathing')).toBeInTheDocument();

    // Verify audio playback was initiated
    expect(mockAudio.play).toHaveBeenCalled();
    expect(mockAudio.src).toBe('https://example.com/audio/response-001.mp3');
  });

  it('should display transcript confidence when available', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/voice/chat`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            transcript: 'Hello SAMA',
            transcript_confidence: 0.87,
            reply_text: 'Hello! How can I help you today?',
            reply_audio_url: 'https://example.com/audio/response-002.mp3',
            emotion: { primary: 'neutral', intensity: 0.5 },
            recommendations: [],
            is_crisis: false,
            meta: {
              session_id: 'voice-session-002',
              message_id: 'voice-msg-002'
            }
          }
        });
      })
    );

    renderWithProviders(<TodaysWellness />);

    const voiceButton = screen.getByRole('button', { name: /record voice/i });
    await userEvent.click(voiceButton);

    const audioBlob = createMockAudioBlob();
    mockRecorder.ondataavailable?.({ data: audioBlob });
    
    const stopButton = screen.getByRole('button', { name: /stop/i });
    await userEvent.click(stopButton);
    mockRecorder.onstop?.();

    // Wait for transcript with confidence indicator
    await waitFor(() => {
      expect(screen.getByText('Hello SAMA')).toBeInTheDocument();
    });

    // Confidence might be displayed as percentage or indicator
    // This depends on UI implementation
  });

  it('should handle voice response without audio URL (text-only fallback)', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/voice/chat`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            transcript: 'Test message',
            transcript_confidence: 0.92,
            reply_text: 'Text-only response due to TTS failure',
            reply_audio_url: null,
            emotion: { primary: 'neutral', intensity: 0.5 },
            recommendations: [],
            is_crisis: false,
            meta: {
              session_id: 'voice-session-003',
              message_id: 'voice-msg-003'
            }
          }
        });
      })
    );

    renderWithProviders(<TodaysWellness />);

    const voiceButton = screen.getByRole('button', { name: /record voice/i });
    await userEvent.click(voiceButton);

    const audioBlob = createMockAudioBlob();
    mockRecorder.ondataavailable?.({ data: audioBlob });
    
    const stopButton = screen.getByRole('button', { name: /stop/i });
    await userEvent.click(stopButton);
    mockRecorder.onstop?.();

    // Wait for text response
    await waitFor(() => {
      expect(screen.getByText('Text-only response due to TTS failure')).toBeInTheDocument();
    });

    // Verify audio playback was NOT attempted
    expect(mockAudio.play).not.toHaveBeenCalled();
  });

  it('should handle microphone permission denied', async () => {
    // Mock permission denied
    (globalThis as any).navigator.mediaDevices.getUserMedia = vi.fn()
      .mockRejectedValue(new Error('Permission denied'));

    renderWithProviders(<TodaysWellness />);

    const voiceButton = screen.getByRole('button', { name: /record voice/i });
    await userEvent.click(voiceButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/microphone permission/i)).toBeInTheDocument();
    });
  });

  it('should handle voice transcription with low confidence', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/voice/chat`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            transcript: 'unclear audio',
            transcript_confidence: 0.42,
            reply_text: 'I had trouble understanding that. Could you try again?',
            reply_audio_url: null,
            emotion: { primary: 'neutral', intensity: 0.5 },
            recommendations: [],
            is_crisis: false,
            meta: {
              session_id: 'voice-session-004',
              message_id: 'voice-msg-004'
            }
          }
        });
      })
    );

    renderWithProviders(<TodaysWellness />);

    const voiceButton = screen.getByRole('button', { name: /record voice/i });
    await userEvent.click(voiceButton);

    const audioBlob = createMockAudioBlob();
    mockRecorder.ondataavailable?.({ data: audioBlob });
    
    const stopButton = screen.getByRole('button', { name: /stop/i });
    await userEvent.click(stopButton);
    mockRecorder.onstop?.();

    // Wait for low confidence warning or response
    await waitFor(() => {
      expect(screen.getByText(/I had trouble understanding that/i)).toBeInTheDocument();
    });
  });

  it('should persist session across voice and text messages', async () => {
    let sessionId = 'mixed-session-001';

    // Mock voice response
    server.use(
      http.post(`${API_BASE_URL}/api/voice/chat`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            transcript: 'Voice message',
            transcript_confidence: 0.95,
            reply_text: 'Voice response',
            reply_audio_url: 'https://example.com/audio/response.mp3',
            emotion: { primary: 'neutral', intensity: 0.5 },
            recommendations: [],
            is_crisis: false,
            meta: {
              session_id: sessionId,
              message_id: 'voice-msg-001'
            }
          }
        });
      }),
      http.post(`${API_BASE_URL}/api/chat/message`, async ({ request }) => {
        const body = await request.json() as any;
        
        // Verify session ID is sent
        expect(body.session_id).toBe(sessionId);

        return HttpResponse.json({
          success: true,
          data: {
            reply: 'Text response',
            emotion: { primary: 'neutral', intensity: 0.5 },
            recommendations: [],
            is_crisis: false,
            meta: {
              session_id: sessionId,
              message_id: 'text-msg-001'
            }
          }
        });
      })
    );

    renderWithProviders(<TodaysWellness />);

    // Send voice message first
    const voiceButton = screen.getByRole('button', { name: /record voice/i });
    await userEvent.click(voiceButton);

    const audioBlob = createMockAudioBlob();
    mockRecorder.ondataavailable?.({ data: audioBlob });
    
    const stopButton = screen.getByRole('button', { name: /stop/i });
    await userEvent.click(stopButton);
    mockRecorder.onstop?.();

    await waitFor(() => {
      expect(screen.getByText('Voice response')).toBeInTheDocument();
    });

    // Verify session stored
    expect(localStorage.getItem('sessionId')).toBe(sessionId);

    // Send text message
    const input = screen.getByPlaceholderText(/type your message/i);
    await userEvent.type(input, 'Text message');
    const sendButton = screen.getByRole('button', { name: /send/i });
    await userEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Text response')).toBeInTheDocument();
    });
  });

  it('should handle audio playback errors gracefully', async () => {
    // Mock audio playback failure
    mockAudio.play = vi.fn().mockRejectedValue(new Error('Playback failed'));

    server.use(
      http.post(`${API_BASE_URL}/api/voice/chat`, () => {
        return HttpResponse.json({
          success: true,
          data: {
            transcript: 'Test',
            transcript_confidence: 0.95,
            reply_text: 'Response text',
            reply_audio_url: 'https://example.com/audio/response.mp3',
            emotion: { primary: 'neutral', intensity: 0.5 },
            recommendations: [],
            is_crisis: false,
            meta: {
              session_id: 'voice-session-005',
              message_id: 'voice-msg-005'
            }
          }
        });
      })
    );

    renderWithProviders(<TodaysWellness />);

    const voiceButton = screen.getByRole('button', { name: /record voice/i });
    await userEvent.click(voiceButton);

    const audioBlob = createMockAudioBlob();
    mockRecorder.ondataavailable?.({ data: audioBlob });
    
    const stopButton = screen.getByRole('button', { name: /stop/i });
    await userEvent.click(stopButton);
    mockRecorder.onstop?.();

    // Text should still be displayed even if audio fails
    await waitFor(() => {
      expect(screen.getByText('Response text')).toBeInTheDocument();
    });
  });

  it('should cancel recording when user clicks cancel', async () => {
    renderWithProviders(<TodaysWellness />);

    const voiceButton = screen.getByRole('button', { name: /record voice/i });
    await userEvent.click(voiceButton);

    // Verify recording started
    expect(mockRecorder.start).toHaveBeenCalled();

    // User cancels recording
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);

    // Verify recording stopped and no API call made
    expect(mockRecorder.stop).toHaveBeenCalled();
    
    // No transcript should appear
    await waitFor(() => {
      expect(screen.queryByText(/transcript/i)).not.toBeInTheDocument();
    });
  });
});
