/**
 * Dashboard Routes
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware';
import { getDashboardSummaryHandler } from '../controllers/dashboardController';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

// All dashboard routes require authentication
router.use(protect);

// GET /api/dashboard/summary
router.get('/summary', asyncHandler(getDashboardSummaryHandler));

export default router;
