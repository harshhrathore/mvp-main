/**
 * Dashboard Service
 * Aggregates data from multiple sources for dashboard view
 */

import { pool } from '../config/db';

export interface DashboardSummary {
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
 * Get comprehensive dashboard summary for authenticated user
 */
export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const client = await pool.connect();

  try {
    // 1. User profile with onboarding status
    const userResult = await client.query(
      `SELECT 
        u.full_name,
        COALESCE(
          uo.step_1_completed AND uo.step_2_completed AND uo.step_3_completed,
          false
        ) as onboarding_completed
       FROM users u
       LEFT JOIN user_onboarding uo ON u.id = uo.user_id
       WHERE u.id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const userProfile = userResult.rows[0];

    // 2. Dosha profile
    let doshaProfile = undefined;
    const doshaResult = await client.query(
      `SELECT primary_dosha, secondary_dosha, prakriti_scores, completed_at as assessed_at
       FROM dosha_assessment 
       WHERE user_id = $1 
       ORDER BY completed_at DESC 
       LIMIT 1`,
      [userId]
    );

    if (doshaResult.rows.length > 0) {
      doshaProfile = doshaResult.rows[0];
      userProfile.primary_dosha = doshaProfile.primary_dosha;
    }

    // 3. Recent daily progress (last 7 days)
    const checkinsResult = await client.query(
      `SELECT 
        date::text,
        avg_emotion_score,
        energy_levels,
        stress_level
       FROM user_progress_daily
       WHERE user_id = $1
       ORDER BY date DESC
       LIMIT 7`,
      [userId]
    );

    // 4. Recent conversations (last 10)
    const conversationsResult = await client.query(
      `SELECT 
        session_id as id,
        session_type,
        duration_seconds,
        start_time as created_at
       FROM conversation_sessions
       WHERE user_id = $1
       ORDER BY start_time DESC
       LIMIT 10`,
      [userId]
    );

    // 5. Recommendations (top 5 by priority)
    const recsResult = await client.query(
      `SELECT 
        recommendation_id as id,
        knowledge_id,
        priority,
        recommended_at
       FROM recommendation_history
       WHERE user_id = $1 
         AND user_accepted = false 
         AND dismissed = false
       ORDER BY 
         CASE priority 
           WHEN 'high' THEN 1
           WHEN 'medium' THEN 2
           WHEN 'low' THEN 3
         END,
         recommended_at DESC
       LIMIT 5`,
      [userId]
    );

    // 6. Stats from user_streaks table
    const streakResult = await client.query(
      `SELECT current_streak, longest_streak
       FROM user_streaks
       WHERE user_id = $1`,
      [userId]
    );

    const statsResult = await client.query(
      `SELECT
        (SELECT COUNT(*) FROM user_progress_daily WHERE user_id = $1) as total_daily_progress,
        (SELECT COUNT(*) FROM conversation_sessions WHERE user_id = $1) as total_conversations`,
      [userId]
    );

    const stats = {
      total_daily_progress: parseInt(statsResult.rows[0]?.total_daily_progress || '0'),
      total_conversations: parseInt(statsResult.rows[0]?.total_conversations || '0'),
      current_streak: parseInt(streakResult.rows[0]?.current_streak || '0'),
    };

    return {
      user_profile: userProfile,
      recent_checkins: checkinsResult.rows,
      dosha_profile: doshaProfile,
      recent_conversations: conversationsResult.rows,
      recommendations: recsResult.rows,
      stats,
    };
  } finally {
    client.release();
  }
}
