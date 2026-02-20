/**
 * Audio Utilities
 * Helper functions for audio recording and processing
 */

/**
 * Convert Blob to base64 string
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        // Remove data URL prefix (e.g., "data:audio/webm;base64,")
        const base64 = reader.result.split(",")[1] || reader.result;
        resolve(base64);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };

    reader.onerror = () => {
      reject(new Error("FileReader error"));
    };

    reader.readAsDataURL(blob);
  });
}

/**
 * Get supported MIME type for audio recording
 */
export function getSupportedMimeType(): string {
  const types = [
    "audio/webm",
    "audio/webm;codecs=opus",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];

  if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported) {
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
  }

  return "audio/webm"; // Fallback
}

/**
 * Format duration in MM:SS format
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Check if browser supports audio recording
 */
export function isAudioRecordingSupported(): boolean {
  return !!(
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function" &&
    typeof MediaRecorder !== "undefined"
  );
}
