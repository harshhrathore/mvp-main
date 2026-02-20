/**
 * Audio Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import { blobToBase64, getSupportedMimeType } from '../audioUtils';

describe('audioUtils', () => {
  describe('blobToBase64', () => {
    it('should convert blob to base64 string', async () => {
      const blob = new Blob(['test data'], { type: 'audio/webm' });

      const base64 = await blobToBase64(blob);

      expect(base64).toBeTruthy();
      expect(typeof base64).toBe('string');
      expect(base64.length).toBeGreaterThan(0);
    });

    it('should handle empty blob', async () => {
      const blob = new Blob([], { type: 'audio/webm' });

      const base64 = await blobToBase64(blob);

      expect(base64).toBeTruthy();
      expect(typeof base64).toBe('string');
    });
  });

  describe('getSupportedMimeType', () => {
    it('should return supported MIME type', () => {
      const mimeType = getSupportedMimeType();

      expect(mimeType).toBeTruthy();
      expect(typeof mimeType).toBe('string');
      expect(mimeType).toMatch(/^audio\//);
    });
  });
});
