import { pool } from "../config/db";
import { EmotionResult } from "../types";
import { emotionToDoshaImpact } from "./emotionService";

/**
 * Save emotion analysis to database
 * Matches schema: emotion_analysis table
 */
export const saveEmotionAnalysis = async (
  messageId: string,
  userId: string,
  emotion: EmotionResult
): Promise<void> => {
  const doshaImpact = emotionToDoshaImpact(emotion.primary_emotion);

  await pool.query(
    `INSERT INTO emotion_analysis
       (message_id, user_id, primary_emotion, primary_confidence,
        all_emotions, emotion_intensity, 
        vata_impact_score, pitta_impact_score, kapha_impact_score,
        recommended_dosha_focus, bert_model_version, processing_time_ms)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
    [
      messageId,
      userId,
      emotion.primary_emotion,
      emotion.primary_confidence,
      JSON.stringify(emotion.all_emotions),
      emotion.emotion_intensity,
      doshaImpact.vata,       // vata_impact_score
      doshaImpact.pitta,      // pitta_impact_score
      doshaImpact.kapha,      // kapha_impact_score
      getRecommendedDoshaFocus(doshaImpact),
      process.env.BERT_MODEL_VERSION || "fallback-v1",
      0,
    ]
  );
};

const getRecommendedDoshaFocus = (impact: { vata: number; pitta: number; kapha: number }): string => {
  const max = Math.max(impact.vata, impact.pitta, impact.kapha);
  if (max === impact.vata) return "Vata";
  if (max === impact.pitta) return "Pitta";
  return "Kapha";
};

/**
 * Get emotion history for a user
 */
export const getEmotionHistory = async (
  userId: string,
  limit: number = 10
): Promise<EmotionResult[]> => {
  const { rows } = await pool.query(
    `SELECT primary_emotion, primary_confidence, all_emotions, emotion_intensity
     FROM emotion_analysis
     WHERE user_id = $1
     ORDER BY analysis_timestamp DESC
     LIMIT $2`,
    [userId, limit]
  );

  return rows.map((row) => ({
    primary_emotion: row.primary_emotion,
    primary_confidence: parseFloat(row.primary_confidence),
    all_emotions: row.all_emotions || {},
    emotion_intensity: row.emotion_intensity,
  }));
};

/**
 * Get emotion stats for a date range
 */
export const getEmotionStats = async (
  userId: string,
  startDate: string,
  endDate: string
): Promise<{ emotion: string; count: number }[]> => {
  const { rows } = await pool.query(
    `SELECT primary_emotion as emotion, COUNT(*) as count
     FROM emotion_analysis
     WHERE user_id = $1 
       AND analysis_timestamp BETWEEN $2 AND $3
     GROUP BY primary_emotion
     ORDER BY count DESC`,
    [userId, startDate, endDate]
  );

  return rows.map((row) => ({
    emotion: row.emotion,
    count: parseInt(row.count, 10),
  }));
};