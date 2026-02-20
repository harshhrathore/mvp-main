/**
 * Voice Recorder Hook
 * React hook for managing audio recording state
 */

import { useState, useRef, useCallback } from 'react';
import { AudioRecorder } from '../utils/AudioRecorder';
import { blobToBase64 } from '../utils/audioUtils';

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  duration: number;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<{ audioData: string; duration: number } | null>;
  resetError: () => void;
}

export function useVoiceRecorder(maxDuration: number = 30): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const recorderRef = useRef<AudioRecorder | null>(null);
  const intervalRef = useRef<number | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      if (!recorderRef.current) {
        recorderRef.current = new AudioRecorder();
      }

      await recorderRef.current.startRecording();
      setIsRecording(true);
      setDuration(0);

      // Update duration every 100ms
      intervalRef.current = window.setInterval(() => {
        if (recorderRef.current) {
          const currentDuration = recorderRef.current.getDuration();
          setDuration(currentDuration);

          // Auto-stop at max duration
          if (currentDuration >= maxDuration) {
            stopRecording();
          }
        }
      }, 100);
    } catch (err: any) {
      setError(err.message || 'Failed to start recording');
      setIsRecording(false);
    }
  }, [maxDuration]);

  const stopRecording = useCallback(async () => {
    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (!recorderRef.current) {
        return null;
      }

      const { blob, duration: recordedDuration } = await recorderRef.current.stopRecording();
      setIsRecording(false);
      setDuration(recordedDuration);

      // Convert blob to base64
      const audioData = await blobToBase64(blob);

      return {
        audioData,
        duration: recordedDuration,
      };
    } catch (err: any) {
      setError(err.message || 'Failed to stop recording');
      setIsRecording(false);
      return null;
    }
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isRecording,
    duration,
    error,
    startRecording,
    stopRecording,
    resetError,
  };
}
