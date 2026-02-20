import { Router } from 'express';
import { endChatSession, getSession } from '../controllers/chatController';
import { sendMessageToPython } from '../controllers/pythonChatController';
import { protect } from '../middleware/authMiddleware';
import { chatLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validationMiddleware';
import { chatMessageValidation } from '../validators/chatValidator';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Chat messages are handled by sama-wellness-backend-main (Python FastAPI)
// POST /api/chat/message → proxied to http://localhost:8000/api/daily_checkin/chat
router.post(
  '/message',
  protect,
  chatLimiter,
  chatMessageValidation,
  validate,
  asyncHandler(sendMessageToPython)
);

// Session management stays in Node.js (uses Supabase directly)
router.post('/end-session', protect, asyncHandler(endChatSession));
router.post('/session/:sessionId/end', protect, asyncHandler(endChatSession)); // Handler for frontend sending ID
router.get('/session', protect, asyncHandler(getSession));
router.get('/session/:sessionId', protect, asyncHandler(getSession)); // Handler for frontend sending ID

export default router;
