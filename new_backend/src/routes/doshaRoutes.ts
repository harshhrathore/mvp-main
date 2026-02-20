import { Router } from 'express';
import { getQuestions, submitQuiz, getProfile } from '../controllers/doshaController';
import { protect } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Public endpoint - no auth required to get questions
router.get('/questions', asyncHandler(getQuestions));

// Protected endpoints - require authentication
router.post('/submit', protect, asyncHandler(submitQuiz));
router.get('/profile', protect, asyncHandler(getProfile));

export default router;
