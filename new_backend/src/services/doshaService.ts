
import { pool } from "../config/db";
import { QuizAnswer, DoshaScores, AssessmentRow } from "../types";

// ── TIER WEIGHTS (physical dominates) 
const TIER_WEIGHTS: Record<string, number> = {
  physical:      0.50,
  physiological: 0.30,
  behavioral:    0.20,
};

// ── CALCULATION 
export interface DoshaResult {
  prakriti_scores: DoshaScores;
  primary_dosha: string;
  secondary_dosha: string;
  confidence_score: number;
}

export const calculateDosha = (answers: QuizAnswer[]): DoshaResult => {
  let scores: DoshaScores = { vata: 0, pitta: 0, kapha: 0 };

  answers.forEach((a) => {
    const tierW = TIER_WEIGHTS[a.tier] || 0.33;
    const dosha = a.selected_dosha.toLowerCase() as keyof DoshaScores;
    scores[dosha] += a.weight * tierW;
  });

  // Normalise to 0-1 summing to 1
  const total = scores.vata + scores.pitta + scores.kapha || 1;
  scores = {
    vata:  parseFloat((scores.vata / total).toFixed(3)),
    pitta: parseFloat((scores.pitta / total).toFixed(3)),
    kapha: parseFloat((scores.kapha / total).toFixed(3)),
  };

  // Sort to find primary & secondary
  const sorted = (Object.entries(scores) as [string, number][]).sort((a, b) => b[1] - a[1]);
  const primary_dosha   = sorted[0][0].charAt(0).toUpperCase() + sorted[0][0].slice(1);
  const secondary_dosha = sorted[1][0].charAt(0).toUpperCase() + sorted[1][0].slice(1);

  // Confidence = how separated primary is from secondary (higher gap = more confident)
  const confidence_score = parseFloat(
    Math.min(0.99, 0.50 + (sorted[0][1] - sorted[1][1]) * 2).toFixed(2)
  );

  return { prakriti_scores: scores, primary_dosha, secondary_dosha, confidence_score };
};

// ── PERSISTENCE 
export const saveAssessment = async (
  userId: string,
  answers: QuizAnswer[],
  result: DoshaResult
): Promise<AssessmentRow> => {
  const { rows } = await pool.query<AssessmentRow>(
    `INSERT INTO dosha_assessment
       (user_id, assessment_type, responses, prakriti_scores, primary_dosha, secondary_dosha, confidence_score)
     VALUES ($1, 'initial', $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      userId,
      JSON.stringify(answers),
      JSON.stringify(result.prakriti_scores),
      result.primary_dosha,
      result.secondary_dosha,
      result.confidence_score,
    ]
  );
  return rows[0];
};

// ── READ — latest assessment for a user 
export const getLatestAssessment = async (userId: string): Promise<AssessmentRow | undefined> => {
  const { rows } = await pool.query<AssessmentRow>(
    `SELECT * FROM dosha_assessment WHERE user_id = $1 ORDER BY completed_at DESC LIMIT 1`,
    [userId]
  );
  return rows[0];
};

// ── TRACKING — save today's vikriti  
export const saveDoshaTracking = async (
  userId: string,
  vikriti: DoshaScores,
  dominantImbalance: string,
  intensity: number,
  detectedEmotion: string | null
): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];
  await pool.query(
    `INSERT INTO dosha_tracking (user_id, date, vikriti_scores, dominant_imbalance, imbalance_intensity, detected_emotion)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id, date) DO UPDATE SET
       vikriti_scores = EXCLUDED.vikriti_scores,
       dominant_imbalance = EXCLUDED.dominant_imbalance,
       imbalance_intensity = EXCLUDED.imbalance_intensity,
       detected_emotion = EXCLUDED.detected_emotion`,
    [userId, today, JSON.stringify(vikriti), dominantImbalance, intensity, detectedEmotion]
  );
};