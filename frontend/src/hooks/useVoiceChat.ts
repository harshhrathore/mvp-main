/**
 * Voice Chat Hooks
 * React Query hooks for voice chat functionality
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { sendVoiceMessage, getAvailableVoices } from '../api/voiceChat';

/**
 * Hook to send voice message to AI
 */
export function useSendVoiceMessage() {
  return useMutation({
    mutationFn: ({ audioData, duration }: { audioData: string; duration?: number }) =>
      sendVoiceMessage(audioData, duration),
  });
}

/**
 * Hook to get available TTS voices
 */
export function useAvailableVoices() {
  return useQuery({
    queryKey: ['voiceChat', 'voices'],
    queryFn: getAvailableVoices,
    staleTime: Infinity, // Voices don't change
  });
}
