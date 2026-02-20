import { Router } from "express";
import { protect } from "../middleware/authMiddleware";
import { checkinProxy } from "../middleware/proxyMiddleware";

const router = Router();

// All checkin routes are proxied to checkin-chat microservice
// GET/POST /api/checkin/* -> http://checkin-chat:8000/api/daily_checkin/*
router.use("/", protect, checkinProxy);

export default router;