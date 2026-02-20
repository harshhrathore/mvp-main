import { Router } from 'express';
import { getStatus, submitHealthBaseline } from '../controllers/onboardingController';
import { protect } from '../middleware/authMiddleware';
import { validate } from '../middleware/validationMiddleware';
import { healthBaselineValidation } from '../validators/chatValidator';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/status', protect, asyncHandler(getStatus));
router.post(
  '/health-baseline',
  protect,
  healthBaselineValidation,
  validate,
  asyncHandler(submitHealthBaseline)
);

export default router;
