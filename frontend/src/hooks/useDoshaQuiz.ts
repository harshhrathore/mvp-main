/**
 * useDoshaQuiz Hook
 * React Query hook for dosha quiz functionality
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDoshaQuestions, submitDoshaQuiz, fetchDoshaProfile, type QuizAnswer } from '../api/dosha';

/**
 * Hook to fetch dosha quiz questions
 */
export function useDoshaQuestions() {
  return useQuery({
    queryKey: ['dosha', 'questions'],
    queryFn: fetchDoshaQuestions,
    staleTime: Infinity, // Questions don't change often
    gcTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

/**
 * Hook to submit dosha quiz
 */
export function useSubmitDoshaQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (answers: QuizAnswer[]) => submitDoshaQuiz(answers),
    onSuccess: () => {
      // Invalidate dosha profile to refetch
      queryClient.invalidateQueries({ queryKey: ['dosha', 'profile'] });
    },
  });
}

/**
 * Hook to fetch dosha profile
 */
export function useDoshaProfile() {
  return useQuery({
    queryKey: ['dosha', 'profile'],
    queryFn: fetchDoshaProfile,
    staleTime: 1000 * 60 * 5, // Consider fresh for 5 minutes
    retry: 1, // Only retry once (404 means no profile exists)
  });
}
