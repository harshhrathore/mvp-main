import { Router } from "express";
import {
  fetchDailyProgress,
  fetchWeeklySummary,
  fetchEmotionTrends,
  fetchDoshaBalance,
  fetchPracticeEffectiveness,
} from "../controllers/analyticsController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/daily",protect, fetchDailyProgress);
router.get("/weekly",protect, fetchWeeklySummary);
router.get("/emotion-trends", protect, fetchEmotionTrends);
router.get("/dosha-balance", protect, fetchDoshaBalance);
router.get("/practice-effectiveness", protect, fetchPracticeEffectiveness);

export default router;