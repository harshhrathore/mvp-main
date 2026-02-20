/**
 * Dashboard Controller
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { getDashboardSummary } from '../services/dashboardService';

/**
 * GET /api/dashboard/summary
 * Get comprehensive dashboard data for authenticated user
 */
export async function getDashboardSummaryHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;

    const summary = await getDashboardSummary(userId);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard summary',
      error: error.message,
    });
  }
}
