import { Response } from "express";
import axios from "axios";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  getOnboarding,
  createOnboarding,
  saveHealthBaseline,
} from "../services/onboardingService";

const PYTHON_SERVICE_URL = process.env.CHECKIN_CHAT_URL || "http://localhost:8000";

// GET /api/onboarding/status
export const getStatus = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  try {
    let ob = await getOnboarding(userId);
    if (!ob) {
      ob = await createOnboarding(userId);
    }
    return res.json({
      success: true,
      data: {
        step_1_done: ob.step_1_done,
        step_2_done: ob.step_2_done,
        step_3_done: ob.step_3_done,
        health_baseline: ob.health_baseline,
      },
    });
  } catch (err) {
    console.error("[onboarding] getStatus —", err);
    return res.status(500).json({ success: false, message: "Failed to fetch onboarding status" });
  }
};

// POST /api/onboarding/health-baseline
export const submitHealthBaseline = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { sleep, energy, appetite, pain, medications } = req.body;

  try {

    let ob = await getOnboarding(userId);
    if (!ob) {
      ob = await createOnboarding(userId);
    }

    const baseline = {
      sleep: Number(sleep),
      energy: Number(energy),
      appetite: Number(appetite),
      pain: Number(pain),
      medications: medications || [],
    };

    await saveHealthBaseline(userId, baseline);

    // Sync with Python AI Service
    try {
      console.log(`[onboarding] Syncing health baseline for user ${userId} to Python AI...`);
      await axios.post(`${PYTHON_SERVICE_URL}/api/onboarding/health-baseline`, {
        user_id: userId,
        baseline: baseline,
      });
      console.log(`[onboarding] Successfully synced health baseline for user ${userId}`);
    } catch (pyErr: any) {
      console.error(`[onboarding] Failed to sync with Python AI: ${pyErr.message}`);
      // Non-blocking error - we still return success to frontend
    }

    return res.json({
      success: true,
      message: "Health baseline saved",
      data: { baseline },
    });
  } catch (err) {
    console.error("[onboarding] submitHealthBaseline —", err);
    return res.status(500).json({ success: false, message: "Failed to save health baseline" });
  }
};