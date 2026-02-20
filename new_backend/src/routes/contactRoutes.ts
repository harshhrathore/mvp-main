/**
 * Contact Routes
 */

import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';
import {
  submitContactForm,
  getUserSubmissions,
  getAllSubmissions,
  updateSubmissionStatus,
  getSubmissionById,
  deleteSubmission,
} from '../controllers/contactController';

const router = Router();

// Public and authenticated routes
router.post('/submit', asyncHandler(submitContactForm)); // Can be used by both

// Protected user routes
router.get('/my-submissions', protect, asyncHandler(getUserSubmissions));

// Admin routes (TODO: Add admin middleware)
router.get('/submissions', protect, asyncHandler(getAllSubmissions));
router.get('/submissions/:submissionId', protect, asyncHandler(getSubmissionById));
router.patch('/submissions/:submissionId', protect, asyncHandler(updateSubmissionStatus));
router.delete('/submissions/:submissionId', protect, asyncHandler(deleteSubmission));

export default router;
