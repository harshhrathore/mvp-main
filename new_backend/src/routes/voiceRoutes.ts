import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import { chatLimiter } from "../middleware/rateLimiter";
import { voiceProxy } from "../middleware/proxyMiddleware";

const router = Router();

// All voice routes are proxied to checkin-voice microservice
// GET/POST /api/voice/* -> http://checkin-voice:8001/api/voice/*
router.use("/", protect, chatLimiter, voiceProxy);

export default router;