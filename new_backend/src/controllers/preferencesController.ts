import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  getPreferences,
  updatePreferences,
  resetPreferences,
} from "../services/preferencesService";

// GET /api/preferences
export const fetchPreferences = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  try {
    const prefs = await getPreferences(userId);
    return res.json({ success: true, data: prefs });
  } catch (err) {
    console.error("[preferences] fetch —", err);
    return res.status(500).json({ success: false, message: "Failed to fetch preferences" });
  }
};

// PATCH /api/preferences
// Body: { voice_gender?, speaking_speed?, ... }
export const updateUserPreferences = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const updates = req.body;

  // Whitelist allowed fields
  const allowedFields = [
    "voice_gender",
    "speaking_speed",
    "background_sounds",
    "preferred_language",
    "morning_reminder",
    "evening_checkin",
    "learning_level",
    "data_for_research",
  ];

  const filteredUpdates: any = {};
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      filteredUpdates[field] = updates[field];
    }
  }

  if (Object.keys(filteredUpdates).length === 0) {
    return res.status(400).json({ success: false, message: "No valid fields to update" });
  }

  try {
    const prefs = await updatePreferences(userId, filteredUpdates);
    return res.json({ success: true, message: "Preferences updated", data: prefs });
  } catch (err) {
    console.error("[preferences] update —", err);
    return res.status(500).json({ success: false, message: "Failed to update preferences" });
  }
};

// POST /api/preferences/reset
export const resetUserPreferences = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  try {
    const prefs = await resetPreferences(userId);
    return res.json({ success: true, message: "Preferences reset to defaults", data: prefs });
  } catch (err) {
    console.error("[preferences] reset —", err);
    return res.status(500).json({ success: false, message: "Failed to reset preferences" });
  }
};