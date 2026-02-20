/**
 * AudioRecorder Tests
 * TDD for audio recording utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AudioRecorder } from '../AudioRecorder';

// Mock MediaRecorder
class MockMediaRecorder {
  state: 'inactive' | 'recording' | 'paused' = 'inactive';
  ondataavailable: ((event: any) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: ((error: any) => void) | null = null;

  start() {
    this.state = 'recording';
  }

  stop() {
    this.state = 'inactive';
    if (this.ondataavailable) {
      this.ondataavailable({ data: new Blob(['mock audio'], { type: 'audio/webm' }) });
    }
    if (this.onstop) {
      this.onstop();
    }
  }

  pause() {
    this.state = 'paused';
  }

  resume() {
    this.state = 'recording';
  }

  static isTypeSupported(type: string) {
    return type === 'audio/webm' || type === 'audio/mp4';
  }
}

(globalThis as any).MediaRecorder = MockMediaRecorder;

describe('AudioRecorder', () => {
  let mockStream: MediaStream;

  beforeEach(() => {
    // Mock getUserMedia
    mockStream = {
      getTracks: () => [
        {
          stop: vi.fn(),
          kind: 'audio',
        } as any,
      ],
    } as MediaStream;

    (globalThis as any).navigator = {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('startRecording', () => {
    it('should request microphone permission and start recording', async () => {
      const recorder = new AudioRecorder();

      await recorder.startRecording();

      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: true,
      });
      expect(recorder.isRecording()).toBe(true);
    });

    it('should throw error if already recording', async () => {
      const recorder = new AudioRecorder();

      await recorder.startRecording();

      await expect(recorder.startRecording()).rejects.toThrow('Already recording');
    });

    it('should throw error if microphone permission denied', async () => {
      const recorder = new AudioRecorder();
      (navigator.mediaDevices.getUserMedia as any).mockRejectedValueOnce(
        new Error('Permission denied')
      );

      await expect(recorder.startRecording()).rejects.toThrow();
    });
  });

  describe('stopRecording', () => {
    it('should stop recording and return audio blob', async () => {
      const recorder = new AudioRecorder();

      await recorder.startRecording();
      const result = await recorder.stopRecording();

      expect(result.blob).toBeInstanceOf(Blob);
      expect(result.duration).toBeGreaterThan(0);
      expect(recorder.isRecording()).toBe(false);
    });

    it('should throw error if not recording', async () => {
      const recorder = new AudioRecorder();

      await expect(recorder.stopRecording()).rejects.toThrow('Not recording');
    });

    it('should cleanup media stream', async () => {
      const recorder = new AudioRecorder();
      const stopSpy = vi.fn();
      mockStream.getTracks()[0].stop = stopSpy;

      await recorder.startRecording();
      await recorder.stopRecording();

      expect(stopSpy).toHaveBeenCalled();
    });
  });

  describe('getDuration', () => {
    it('should return recording duration in seconds', async () => {
      const recorder = new AudioRecorder();

      await recorder.startRecording();
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const duration = recorder.getDuration();
      expect(duration).toBeGreaterThan(0);
    });

    it('should return 0 when not recording', () => {
      const recorder = new AudioRecorder();

      expect(recorder.getDuration()).toBe(0);
    });
  });
});
