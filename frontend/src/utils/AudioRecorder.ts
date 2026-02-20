/**
 * AudioRecorder Class
 * Wrapper around MediaRecorder API for audio recording
 */

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private startTime: number = 0;
  private recordedDuration: number = 0;

  /**
   * Start recording audio from microphone
   */
  async startRecording(): Promise<void> {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      throw new Error('Already recording');
    }

    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Determine supported MIME type
      const mimeType = this.getSupportedMimeType();

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
      });

      this.audioChunks = [];
      this.startTime = Date.now();

      // Handle data available
      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      // Start recording
      this.mediaRecorder.start();
    } catch (error: any) {
      this.cleanup();
      if (error.name === 'NotAllowedError') {
        throw new Error('Microphone permission denied');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No microphone found');
      }
      throw error;
    }
  }

  /**
   * Stop recording and return audio blob
   */
  async stopRecording(): Promise<{ blob: Blob; duration: number }> {
    if (!this.mediaRecorder || this.mediaRecorder.state !== 'recording') {
      throw new Error('Not recording');
    }

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder not initialized'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        this.recordedDuration = (Date.now() - this.startTime) / 1000;

        const blob = new Blob(this.audioChunks, {
          type: this.mediaRecorder?.mimeType || 'audio/webm',
        });

        this.cleanup();

        resolve({
          blob,
          duration: this.recordedDuration,
        });
      };

      this.mediaRecorder.onerror = (event: any) => {
        this.cleanup();
        reject(new Error(`Recording error: ${event.error?.message || 'Unknown error'}`));
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  /**
   * Get current recording duration in seconds
   */
  getDuration(): number {
    if (this.isRecording()) {
      return (Date.now() - this.startTime) / 1000;
    }
    return this.recordedDuration;
  }

  /**
   * Get supported MIME type for audio recording
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm',
      'audio/webm;codecs=opus',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // Fallback
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
}
