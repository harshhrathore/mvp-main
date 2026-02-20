import { Router } from 'express';
import {
  fetchRecommendations,
  completeRecommendation,
} from '../controllers/recommendationController';
import { protect } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', protect, asyncHandler(fetchRecommendations));
router.post('/complete', protect, asyncHandler(completeRecommendation));

export default router;
