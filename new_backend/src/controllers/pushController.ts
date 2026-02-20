import { Request, Response } from 'express';
import webpush from 'web-push';
import { pool } from '../config/db';

const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

if (publicVapidKey && privateVapidKey) {
    webpush.setVapidDetails(
        'mailto:noreply@samawellness.ai',
        publicVapidKey,
        privateVapidKey
    );
} else {
    console.warn("VAPID keys are missing! Push notifications will not work.");
}

export const getVapidPublicKey = (req: Request, res: Response) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
};

export const subscribe = async (req: Request, res: Response) => {
    try {
        const subscription = req.body;
        // Assuming authentication middleware adds user to req
        // const userId = (req as any).user?.id; 
        // If auth middleware is not yet fully integrated or this is public (unlikely), handle appropriately.
        // Based on user request, this is for logged in users.
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ error: 'Invalid subscription object' });
        }

        // Save to DB
        const query = `
      INSERT INTO push_subscriptions (user_id, endpoint, p256dh_key, auth_secret, last_active)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, endpoint) 
      DO UPDATE SET last_active = CURRENT_TIMESTAMP
      RETURNING id
    `;

        const values = [
            userId,
            subscription.endpoint,
            subscription.keys.p256dh,
            subscription.keys.auth
        ];

        await pool.query(query, values);

        res.status(201).json({ message: 'Subscription added successfully' });
    } catch (error) {
        console.error('Error subscribing to push notifications:', error);
        res.status(500).json({ error: 'Failed to subscribe' });
    }
};

export const unsubscribe = async (req: Request, res: Response) => {
    try {
        const { endpoint } = req.body;
        const userId = (req as any).user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        await pool.query('DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2', [userId, endpoint]);
        res.status(200).json({ message: 'Unsubscribed successfully' });
    } catch (error) {
        console.error('Error unsubscribing:', error);
        res.status(500).json({ error: 'Failed to unsubscribe' });
    }
};

// Helper function to send push notification to a user
export const sendPushNotificationToUser = async (userId: string, payload: any) => {
    try {
        const result = await pool.query('SELECT * FROM push_subscriptions WHERE user_id = $1', [userId]);
        const subscriptions = result.rows;

        if (subscriptions.length === 0) {
            return;
        }

        const notifications = subscriptions.map(async sub => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    p256dh: sub.p256dh_key,
                    auth: sub.auth_secret
                }
            };
            try {
                await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
            } catch (err: any) {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    // Subscription expired or gone, delete from DB
                    await pool.query('DELETE FROM push_subscriptions WHERE id = $1', [sub.id]);
                } else {
                    console.error('Error sending push:', err);
                }
            }
        });

        await Promise.all(notifications);
    } catch (error) {
        console.error('Error sending push notifications to user:', userId, error);
    }
}
