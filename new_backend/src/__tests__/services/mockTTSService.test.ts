/**
 * Mock TTS Service Tests
 * TDD for text-to-speech mock service
 */

import { mockTTSService } from '../../services/mockTTSService';

describe('Mock TTS Service', () => {
  it('should generate audio URL from text', async () => {
    const text = 'Hello, how are you feeling today?';

    const result = await mockTTSService.synthesize(text);

    expect(result.audioUrl).toBeTruthy();
    expect(typeof result.audioUrl).toBe('string');
  });

  it('should return consistent format', async () => {
    const result = await mockTTSService.synthesize('Test text');

    expect(result).toHaveProperty('audioUrl');
    expect(result).toHaveProperty('duration');
    expect(result.duration).toBeGreaterThan(0);
  });

  it('should estimate duration based on text length', async () => {
    const shortText = 'Hi';
    const longText = 'This is a much longer text that should take more time to speak out loud.';

    const shortResult = await mockTTSService.synthesize(shortText);
    const longResult = await mockTTSService.synthesize(longText);

    expect(longResult.duration).toBeGreaterThan(shortResult.duration);
  });

  it('should simulate realistic delay', async () => {
    const start = Date.now();

    await mockTTSService.synthesize('Test');

    const duration = Date.now() - start;
    expect(duration).toBeGreaterThan(100);
    expect(duration).toBeLessThan(2000);
  });
});
