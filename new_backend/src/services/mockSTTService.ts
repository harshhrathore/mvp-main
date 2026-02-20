/**
 * Mock Speech-to-Text Service
 * Simulates STT for development/testing without external API calls
 */

export interface STTResult {
  transcript: string;
  confidence: number;
  language?: string;
  duration?: number;
}

/**
 * Mock transcripts for development
 */
const MOCK_TRANSCRIPTS = [
  "I'm feeling stressed and anxious today.",
  "I had trouble sleeping last night.",
  "I've been experiencing headaches lately.",
  "I feel more energetic after doing yoga.",
  "My digestion has been off recently.",
  "I'm feeling calm and peaceful right now.",
  "I've been having mood swings.",
  "I feel irritable and short-tempered.",
  "I'm feeling balanced and centered.",
  "I've been feeling tired and sluggish.",
  "I'm experiencing lower back pain.",
  "I feel motivated and focused today.",
  "I've been dealing with anxiety.",
  "My appetite has decreased lately.",
  "I'm feeling restless and can't sit still.",
];

/**
 * Mock STT Service
 */
class MockSTTService {
  /**
   * Simulate speech-to-text transcription
   */
  async transcribe(audioData: string): Promise<STTResult> {
    // Simulate API delay (300-800ms)
    const delay = 300 + Math.random() * 500;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Return random mock transcript
    const transcript = MOCK_TRANSCRIPTS[Math.floor(Math.random() * MOCK_TRANSCRIPTS.length)];
    const confidence = 0.85 + Math.random() * 0.14; // 0.85 - 0.99

    return {
      transcript,
      confidence: Number(confidence.toFixed(2)),
      language: 'en-US',
      duration: delay / 1000,
    };
  }

  /**
   * Check if service is available
   */
  async checkHealth(): Promise<boolean> {
    return true;
  }
}

export const mockSTTService = new MockSTTService();
