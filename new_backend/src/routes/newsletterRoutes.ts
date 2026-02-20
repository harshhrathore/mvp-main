/**
 * Newsletter Routes
 */

import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
    subscribe,
    confirmSubscription,
    unsubscribe,
    getSubscriber,
    updatePreferences,
    trackEmailOpen,
    getStatistics,
    getAllSubscribers
} from '../controllers/newsletterController';

const router = Router();

// Public routes
router.post('/subscribe', subscribe);
router.get('/confirm/:token', confirmSubscription);
router.post('/unsubscribe', unsubscribe);

// Tracking pixel (public)
router.get('/track/:campaignId/:subscriberId/open.png', trackEmailOpen);

// Protected routes
router.get('/subscriber/:email', protect, getSubscriber);
router.patch('/subscriber/:email/preferences', protect, updatePreferences);

// Admin routes (TODO: Add admin middleware)
router.get('/statistics', protect, getStatistics);
router.get('/subscribers', protect, getAllSubscribers);

export default router;
