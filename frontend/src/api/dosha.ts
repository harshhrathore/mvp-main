/**
 * Dosha API Functions
 * API client for dosha quiz and profile management
 */

import { api } from '../api';

export interface DoshaOption {
  option_text: string;
  dosha: 'vata' | 'pitta' | 'kapha';
  weight: number;
}

export interface DoshaQuestion {
  question_id: number;
  question_text: string;
  tier: 'physical' | 'physiological' | 'behavioral';
  options: DoshaOption[];
}

export interface DoshaQuestionsResponse {
  questions: DoshaQuestion[];
  version: string;
}

export interface QuizAnswer {
  question_id: string;
  selected_option: number;
  selected_dosha: 'Vata' | 'Pitta' | 'Kapha';
  weight: number;
  tier: 'physical' | 'physiological' | 'behavioral';
}

export interface DoshaScores {
  vata: number;
  pitta: number;
  kapha: number;
}

export interface DoshaResult {
  primary_dosha: string;
  secondary_dosha: string;
  scores: DoshaScores;
  confidence: number;
}

export interface DoshaProfile extends DoshaResult {
  assessed_at: string;
}

/**
 * Fetch dosha quiz questions
 */
export async function fetchDoshaQuestions(): Promise<DoshaQuestionsResponse> {
  const response = await api.get('/api/dosha/questions');
  return response.data.data;
}

/**
 * Submit dosha quiz answers
 */
export async function submitDoshaQuiz(answers: QuizAnswer[]): Promise<DoshaResult> {
  const response = await api.post('/api/dosha/submit', { answers });
  return response.data.data;
}

/**
 * Fetch user's dosha profile
 */
export async function fetchDoshaProfile(): Promise<DoshaProfile> {
  const response = await api.get('/api/dosha/profile');
  return response.data.data;
}
