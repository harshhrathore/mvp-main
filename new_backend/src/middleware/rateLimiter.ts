import rateLimit from "express-rate-limit";

// ── Global — every single request 
export const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60_000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please wait and try again." },
});

// ── Auth — login / register only 
export const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 10,                  // 10 attempts per 15 min
  skipSuccessfulRequests: true,
  message: { success: false, message: "Too many auth attempts. Please wait 15 minutes." },
});

// ── Chat — per-user message flood prevention 
export const chatLimiter = rateLimit({
  windowMs: 60_000,         // 1 min
  max: 15,                  // 15 messages / minute
  message: { success: false, message: "Slow down — sending messages too fast." },
  keyGenerator: (req) => {
    // Rate-limit per authenticated user, not per IP
    const body = req.body as { userId?: string };
    return body.userId || req.ip || "unknown";
  },
});