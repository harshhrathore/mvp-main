import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  getDailyProgress,
  getWeeklySummary,
  getEmotionTrends,
  getDoshaBalanceTrend,
  getPracticeEffectiveness,
} from "../services/analyticsService";

// GET /api/analytics/daily?days=7
export const fetchDailyProgress = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const days = parseInt(req.query.days as string) || 7;

  if (days < 1 || days > 90) {
    return res.status(400).json({ success: false, message: "days must be between 1 and 90" });
  }

  try {
    const progress = await getDailyProgress(userId, days);
    return res.json({ success: true, data: progress });
  } catch (err) {
    console.error("[analytics] fetchDailyProgress —", err);
    return res.status(500).json({ success: false, message: "Failed to fetch daily progress" });
  }
};

// GET /api/analytics/weekly
export const fetchWeeklySummary = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  try {
    const summary = await getWeeklySummary(userId);
    if (!summary) {
      return res.json({ success: true, data: null, message: "No data for this week yet" });
    }
    return res.json({ success: true, data: summary });
  } catch (err) {
    console.error("[analytics] fetchWeeklySummary —", err);
    return res.status(500).json({ success: false, message: "Failed to fetch weekly summary" });
  }
};

// GET /api/analytics/emotion-trends
export const fetchEmotionTrends = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  try {
    const trends = await getEmotionTrends(userId);
    return res.json({ success: true, data: trends });
  } catch (err) {
    console.error("[analytics] fetchEmotionTrends —", err);
    return res.status(500).json({ success: false, message: "Failed to fetch emotion trends" });
  }
};

// GET /api/analytics/dosha-balance
export const fetchDoshaBalance = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  try {
    const balance = await getDoshaBalanceTrend(userId);
    return res.json({ success: true, data: balance });
  } catch (err) {
    console.error("[analytics] fetchDoshaBalance —", err);
    return res.status(500).json({ success: false, message: "Failed to fetch dosha balance" });
  }
};

// GET /api/analytics/practice-effectiveness
export const fetchPracticeEffectiveness = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  try {
    const practices = await getPracticeEffectiveness(userId);
    return res.json({ success: true, data: practices });
  } catch (err) {
    console.error("[analytics] fetchPracticeEffectiveness —", err);
    return res.status(500).json({ success: false, message: "Failed to fetch practice effectiveness" });
  }
};