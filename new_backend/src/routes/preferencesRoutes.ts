import { Router } from "express";
import {
  fetchPreferences,
  updateUserPreferences,
  resetUserPreferences,
} from "../controllers/preferencesController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/",     protect, fetchPreferences);
router.patch("/",   protect, updateUserPreferences);
router.post("/reset", protect, resetUserPreferences);

export default router;