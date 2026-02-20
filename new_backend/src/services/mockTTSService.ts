/**
 * Mock Text-to-Speech Service
 * Simulates TTS for development/testing without external API calls
 */

export interface TTSResult {
  audioUrl: string;
  duration: number;
  format?: string;
}

/**
 * Mock TTS Service
 */
class MockTTSService {
  /**
   * Simulate text-to-speech synthesis
   */
  async synthesize(text: string, voice?: string): Promise<TTSResult> {
    // Simulate API delay (200-600ms)
    const delay = 200 + Math.random() * 400;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Generate mock audio URL
    const audioUrl = this.generateMockAudioUrl(text);

    // Estimate duration based on text length (roughly 150 words per minute)
    const wordCount = text.split(' ').length;
    const estimatedDuration = (wordCount / 150) * 60; // seconds

    return {
      audioUrl,
      duration: Number(estimatedDuration.toFixed(2)),
      format: 'audio/mpeg',
    };
  }

  /**
   * Generate mock audio URL
   * In a real implementation, this would be a URL to actual audio
   */
  private generateMockAudioUrl(text: string): string {
    // Use a silent audio data URL as placeholder
    const silentAudioData = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    
    // In production, this would return a real URL from TTS service
    return silentAudioData;
  }

  /**
   * Check if service is available
   */
  async checkHealth(): Promise<boolean> {
    return true;
  }
}

export const mockTTSService = new MockTTSService();
