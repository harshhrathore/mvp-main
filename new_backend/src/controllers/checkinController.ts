import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { detectEmotion } from "../services/emotionService";
import { detectCrisis, logSafetyEvent, buildCrisisResponse } from "../services/safetyService";
import { updateStreak } from "../services/streakService";
import { pool } from "../config/db";
import { todayIST } from "../utils/helpers";

// POST /api/checkin
// Body: { text, emotion, sleep_quality?, energy_levels?, stress_level? }
export const submitCheckin = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { text, sleep_quality, energy_levels, stress_level } = req.body;

  try {
    // ─ 1. Emotion detection
    const emotion = await detectEmotion(text);

    // ─ 2. Safety check
    const safety = detectCrisis(text);
    let aiReply = `Thank you for checking in. I detected that you're feeling ${emotion.primary_emotion} right now.`;

    if (safety.is_crisis) {
      await logSafetyEvent(userId, null, safety);
      aiReply = buildCrisisResponse(safety.crisis_level);
    }

    // ─ 3. Persist daily progress row (upsert)
    const today = todayIST();
    await pool.query(
      `INSERT INTO user_progress_daily
         (user_id, date, avg_emotion_score, primary_emotion_day,
          conversations_count, sleep_quality, energy_levels, stress_level)
       VALUES ($1, $2, $3, $4, 1, $5, $6, $7)
       ON CONFLICT (user_id, date) DO UPDATE SET
         avg_emotion_score = $3,
         primary_emotion_day = $4,
         conversations_count = user_progress_daily.conversations_count + 1,
         sleep_quality = COALESCE($5::INT, user_progress_daily.sleep_quality),
         energy_levels = COALESCE($6::INT, user_progress_daily.energy_levels),
         stress_level  = COALESCE($7::INT, user_progress_daily.stress_level)`,
      [
        userId,
        today,
        emotion.emotion_intensity,
        emotion.primary_emotion,
        sleep_quality || null,
        energy_levels || null,
        stress_level || null,
      ]
    );

    // ─ 4. Update streak 
    await updateStreak(userId);

    return res.json({
      success: true,
      data: {
        ai_reply: aiReply,
        emotion: { primary: emotion.primary_emotion, intensity: emotion.emotion_intensity },
        is_crisis: safety.is_crisis,
      },
    });
  } catch (err) {
    console.error("[checkin] submitCheckin —", err);
    return res.status(500).json({ success: false, message: "Check-in failed. Please try again." });
  }
};

// GET /api/checkin/today
// Returns today's progress snapshot
export const getTodayProgress = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const today = todayIST();

  try {
    const { rows } = await pool.query(
      `SELECT * FROM user_progress_daily WHERE user_id = $1 AND date = $2`,
      [userId, today]
    );

    const streak = await (async () => {
      const { getStreak } = await import("../services/streakService");
      return getStreak(userId);
    })();

    return res.json({
      success: true,
      data: {
        progress: rows[0] || null,
        streak: streak
          ? { current: streak.current_streak, longest: streak.longest_streak }
          : { current: 0, longest: 0 },
      },
    });
  } catch (err) {
    console.error("[checkin] getTodayProgress —", err);
    return res.status(500).json({ success: false, message: "Failed to fetch progress" });
  }
};