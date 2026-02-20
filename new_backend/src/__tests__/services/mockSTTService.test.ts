/**
 * Mock STT Service Tests
 * TDD for speech-to-text mock service
 */

import { mockSTTService } from '../../services/mockSTTService';

describe('Mock STT Service', () => {
  it('should transcribe audio to text', async () => {
    const mockAudioData = 'base64_audio_data_here';

    const result = await mockSTTService.transcribe(mockAudioData);

    expect(result.transcript).toBeTruthy();
    expect(typeof result.transcript).toBe('string');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  it('should return different transcripts for variety', async () => {
    const transcripts = new Set();

    for (let i = 0; i < 10; i++) {
      const result = await mockSTTService.transcribe('mock_audio');
      transcripts.add(result.transcript);
    }

    // Should have some variety in mock responses
    expect(transcripts.size).toBeGreaterThan(1);
  });

  it('should simulate realistic delay', async () => {
    const start = Date.now();

    await mockSTTService.transcribe('mock_audio');

    const duration = Date.now() - start;
    expect(duration).toBeGreaterThan(100); // At least 100ms
    expect(duration).toBeLessThan(2000); // Less than 2 seconds
  });
});
