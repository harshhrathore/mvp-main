import { Router } from 'express';
import { submitQuiz } from '../controllers/quizController';
import { protect } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
router.post('/submit', protect, asyncHandler(submitQuiz));

export default router;
