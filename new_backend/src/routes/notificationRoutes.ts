import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';
import { protect } from '../middleware/authMiddleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Retrieve all notifications
router.get('/', protect, asyncHandler(notificationController.getNotifications));

// Mark all as read
router.put('/read-all', protect, asyncHandler(notificationController.markAllRead));

// Mark single as read
router.put('/:id/read', protect, asyncHandler(notificationController.markRead));

// Send notification (Internal/Admin use)
router.post('/send', protect, asyncHandler(notificationController.sendNotification));

// Send bulk notifications (Internal/Admin use)
router.post('/send-bulk', protect, asyncHandler(notificationController.sendBulk));

export default router;
