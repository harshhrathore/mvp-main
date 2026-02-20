/**
 * Dashboard API
 */

import { api } from '../api';

export interface DashboardData {
  user_profile: {
    full_name: string;
    primary_dosha?: string;
    onboarding_completed: boolean;
  };
  recent_checkins: Array<{
    date: string;
    avg_emotion_score: number;
    energy_levels: number;
    stress_level: number;
  }>;
  dosha_profile?: {
    primary_dosha: string;
    secondary_dosha: string;
    prakriti_scores: Record<string, number>;
    assessed_at: string;
  };
  recent_conversations: Array<{
    id: string;
    session_type: string;
    duration_seconds: number;
    created_at: string;
  }>;
  recommendations: Array<{
    id: string;
    knowledge_id: string;
    priority: string;
    recommended_at: string;
  }>;
  stats: {
    total_daily_progress: number;
    total_conversations: number;
    current_streak: number;
  };
}

/**
 * Fetch comprehensive dashboard summary
 */
export async function fetchDashboardSummary(): Promise<DashboardData> {
  const response = await api.get('/api/dashboard/summary');
  return response.data;
}
