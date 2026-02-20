import { Router } from "express";
import { logActivity } from "../controllers/activityController";
import { protect } from "../middleware/authMiddleware";

const router = Router();
router.post("/", protect, logActivity);

export default router;
