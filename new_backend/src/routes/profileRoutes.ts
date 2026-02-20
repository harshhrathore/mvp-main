/**
 * Profile Routes
 */

import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';
import {
  getProfile,
  getCompleteProfile,
  updateProfile,
  updateUserInfo,
  updateProfilePhoto,
  updateCoverPhoto,
  getActivityHistory,
  getProfileStats,
  deleteProfile,
} from '../controllers/profileController';

const router = Router();

// All profile routes require authentication
router.use(protect);

// Profile endpoints
router.get('/', asyncHandler(getProfile));
router.get('/complete', asyncHandler(getCompleteProfile));
router.patch('/', asyncHandler(updateProfile));
router.delete('/', asyncHandler(deleteProfile));

// User info
router.patch('/user-info', asyncHandler(updateUserInfo));

// Photos
router.patch('/photo', asyncHandler(updateProfilePhoto));
router.patch('/cover-photo', asyncHandler(updateCoverPhoto));

// Activity and stats
router.get('/activity', asyncHandler(getActivityHistory));
router.get('/stats', asyncHandler(getProfileStats));

export default router;
