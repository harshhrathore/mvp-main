import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { pool } from "../config/db";

// GET /api/recommendations
// Returns the 5 most recent recommendations for this user
export const fetchRecommendations = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  try {
    const { rows } = await pool.query(
      `SELECT rh.*, ak.title AS practice_title, ak.content_type, ak.duration_minutes,
              ak.description_short, ak.steps
       FROM recommendation_history rh
       LEFT JOIN ayurveda_knowledge ak ON rh.knowledge_id = ak.knowledge_id
       WHERE rh.user_id = $1
       ORDER BY rh.recommended_at DESC
       LIMIT 5`,
      [userId]
    );

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error("[recommendations] fetch —", err);
    return res.status(500).json({ success: false, message: "Failed to fetch recommendations" });
  }
};

// POST /api/recommendations/complete
// Body: { recommendation_id, effectiveness_rating }
export const completeRecommendation = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { recommendation_id, effectiveness_rating } = req.body;

  if (!recommendation_id) {
    return res.status(400).json({ success: false, message: "recommendation_id is required" });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE recommendation_history
       SET completed = TRUE,
           user_accepted = TRUE,
           effectiveness_rating = $1
       WHERE recommendation_id = $2 AND user_id = $3
       RETURNING *`,
      [effectiveness_rating || null, recommendation_id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Recommendation not found" });
    }

 
    if (rows[0].knowledge_id && effectiveness_rating) {
      await pool.query(
        `UPDATE ayurveda_knowledge
         SET avg_effectiveness = (
           SELECT AVG(effectiveness_rating)
           FROM recommendation_history
           WHERE knowledge_id = $1 AND effectiveness_rating IS NOT NULL
         )
         WHERE knowledge_id = $1`,
        [rows[0].knowledge_id]
      );
    }

    return res.json({ success: true, message: "Practice completed!", data: rows[0] });
  } catch (err) {
    console.error("[recommendations] complete —", err);
    return res.status(500).json({ success: false, message: "Failed to update recommendation" });
  }
};