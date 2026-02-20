import { pool } from "../config/db";
import { todayIST } from "../utils/helpers";

export interface DailyStats {
  date: string;
  conversations_count: number;
  avg_emotion_score: number;
  primary_emotion: string;
  practices_completed: number;
  sleep_quality: number | null;
  energy_levels: number | null;
  stress_level: number | null;
}

export interface WeeklySummary {
  week_start: string;
  week_end: string;
  total_conversations: number;
  avg_emotion_score: number;
  emotion_stability: number;
  top_emotions: string[];
  practices_completed: number;
  avg_sleep: number;
  avg_energy: number;
  avg_stress: number;
}

/**
 * Get daily progress for a user (last N days)
 */
export const getDailyProgress = async (
  userId: string,
  days: number = 7
): Promise<DailyStats[]> => {
  const { rows } = await pool.query(
    `SELECT 
       date,
       conversations_count,
       avg_emotion_score,
       primary_emotion_day as primary_emotion,
       practices_completed,
       sleep_quality,
       energy_levels,
       stress_level
     FROM user_progress_daily
     WHERE user_id = $1
     ORDER BY date DESC
     LIMIT $2`,
    [userId, days]
  );
  return rows;
};

/**
 * Get weekly summary (aggregated stats)
 */
export const getWeeklySummary = async (userId: string): Promise<WeeklySummary | null> => {
  const today = todayIST();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split("T")[0];

  const { rows } = await pool.query(
    `SELECT 
       $2 as week_start,
       $3 as week_end,
       SUM(conversations_count) as total_conversations,
       ROUND(AVG(avg_emotion_score)::numeric, 1) as avg_emotion_score,
       ROUND(STDDEV(avg_emotion_score)::numeric, 1) as emotion_stability,
       ROUND(AVG(sleep_quality)::numeric, 1) as avg_sleep,
       ROUND(AVG(energy_levels)::numeric, 1) as avg_energy,
       ROUND(AVG(stress_level)::numeric, 1) as avg_stress,
       SUM(practices_completed) as practices_completed
     FROM user_progress_daily
     WHERE user_id = $1 AND date >= $2 AND date <= $3`,
    [userId, weekAgoStr, today]
  );

  if (rows.length === 0 || !rows[0].total_conversations) {
    return null;
  }

  // Get top 3 emotions this week
  const emotionRows = await pool.query(
    `SELECT primary_emotion_day, COUNT(*) as cnt
     FROM user_progress_daily
     WHERE user_id = $1 AND date >= $2 AND date <= $3 AND primary_emotion_day IS NOT NULL
     GROUP BY primary_emotion_day
     ORDER BY cnt DESC
     LIMIT 3`,
    [userId, weekAgoStr, today]
  );

  return {
    ...rows[0],
    top_emotions: emotionRows.rows.map((r) => r.primary_emotion_day),
  };
};

/**
 * Get emotion trends (last 30 days)
 */
export const getEmotionTrends = async (userId: string): Promise<any[]> => {
  const { rows } = await pool.query(
    `SELECT 
       date,
       primary_emotion_day as emotion,
       avg_emotion_score as intensity
     FROM user_progress_daily
     WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '30 days'
     ORDER BY date ASC`,
    [userId]
  );
  return rows;
};

/**
 * Get dosha balance trend (last 30 days)
 */
export const getDoshaBalanceTrend = async (userId: string): Promise<any[]> => {
  const { rows } = await pool.query(
    `SELECT 
       date,
       vikriti_scores,
       dominant_imbalance,
       imbalance_intensity
     FROM dosha_tracking
     WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '30 days'
     ORDER BY date ASC`,
    [userId]
  );
  return rows;
};

/**
 * Get practice effectiveness (which practices work best for this user)
 */
export const getPracticeEffectiveness = async (userId: string): Promise<any[]> => {
  const { rows } = await pool.query(
    `SELECT 
       ak.title,
       ak.content_type,
       COUNT(*) as times_done,
       ROUND(AVG(rh.effectiveness_rating)::numeric, 1) as avg_rating
     FROM recommendation_history rh
     JOIN ayurveda_knowledge ak ON rh.knowledge_id = ak.knowledge_id
     WHERE rh.user_id = $1 AND rh.completed = TRUE AND rh.effectiveness_rating IS NOT NULL
     GROUP BY ak.knowledge_id, ak.title, ak.content_type
     ORDER BY avg_rating DESC, times_done DESC
     LIMIT 10`,
    [userId]
  );
  return rows;
};