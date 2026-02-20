import { Router } from 'express';
import {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerification,
} from '../controllers/authController';
import { registerValidation, loginValidation } from '../validators/authValidator';
import { validate } from '../middleware/validationMiddleware';
import { protect } from '../middleware/authMiddleware';
import { authLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Public — rate-limited
router.post('/register', authLimiter, registerValidation, validate, asyncHandler(register));
router.post('/login', authLimiter, loginValidation, validate, asyncHandler(login));

// Email verification - public
router.get('/verify-email/:token', asyncHandler(verifyEmail));
router.post('/resend-verification', authLimiter, asyncHandler(resendVerification));

// Protected
router.get('/me', protect, asyncHandler(getMe));

export default router;
