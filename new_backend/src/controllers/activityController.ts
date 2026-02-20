import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { saveActivity } from "../services/activityService";
import { updateStreak } from "../services/streakService";

export const logActivity = async (req: AuthRequest, res: Response) => {
  const { type, name, moodBefore, moodAfter } = req.body;
  const userId = req.user?.userId!;

  try {
    await saveActivity(userId, type, name, moodBefore, moodAfter);
  } catch {
    console.log("DB not connected yet");
  }

  await updateStreak(userId);

  res.json({ message: "Activity logged" });
};
