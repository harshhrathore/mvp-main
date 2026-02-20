import express from 'express';
import { getVapidPublicKey, subscribe, unsubscribe } from '../controllers/pushController';
import { protect } from '../middleware/authMiddleware'; // Assuming this exists

const router = express.Router();

router.get('/vapid-public-key', getVapidPublicKey);
router.post('/subscribe', protect, subscribe);
router.post('/unsubscribe', protect, unsubscribe);

export default router;
