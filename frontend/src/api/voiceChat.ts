/**
 * Voice Chat API
 */

import { api } from '../api';

export interface VoiceMessageRequest {
  audio_data: string; // base64
  duration?: number;
}

export interface VoiceMessageResponse {
  transcript: string;
  response_text: string;
  audio_url?: string;
  emotion?: {
    primary: string;
    intensity: number;
  };
}

/**
 * Send voice message to AI
 */
export async function sendVoiceMessage(audioData: string, duration?: number): Promise<VoiceMessageResponse> {
  const response = await api.post('/api/voice/message', {
    audio_data: audioData,
    duration,
  });
  return response.data;
}

/**
 * Get available voices for TTS
 */
export async function getAvailableVoices(): Promise<string[]> {
  const response = await api.get('/api/voice/voices');
  return response.data.voices || [];
}
