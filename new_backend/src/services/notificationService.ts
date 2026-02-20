import { pool } from "../config/db";
import { sendToUser } from "./socketService";

interface NotificationPayload {
    userId: string;
    title: string;
    body: string;
    type?: string;
    data?: any;
}

export class NotificationService {

    /**
     * Send a notification to a single user.
     * Persists to DB and emits via Socket.IO.
     */
    static async sendNotification(payload: NotificationPayload) {
        const { userId, title, body, type = 'info', data = {} } = payload;

        try {
            // 1. Persist to Database
            const query = `
                INSERT INTO notifications (user_id, title, body, type, data, created_at)
                VALUES ($1, $2, $3, $4, $5, NOW())
                RETURNING *;
            `;
            const values = [userId, title, body, type, data];
            const result = await pool.query(query, values);
            const notification = result.rows[0];

            // 2. Emit Real-time Event
            // We optimize payload for frontend
            sendToUser(userId, 'notification', {
                id: notification.id,
                title: notification.title,
                body: notification.body,
                type: notification.type,
                timestamp: notification.created_at,
                data: notification.data
            });

            return notification;
        } catch (error) {
            console.error(`Error sending notification to user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Send a notification to multiple users (e.g., up to 500).
     * Uses batching for DB inserts to be efficient.
     */
    static async sendBulkNotifications(userIds: string[], title: string, body: string, type: string = 'info', data: any = {}) {
        if (!userIds || userIds.length === 0) return [];

        try {
            // 1. Bulk Insert into DB
            // We'll construct a large value list string: ($1, $2, ...), ($4, ...)
            // Or use UNNEST if array passing is supported well, but parameterized generic loop is safer for compatibility.
            // For 500 users, single INSERT with multiple VALUES is efficient enough.

            // Generate placeholders: ($1, $2, $3, $4, $5, NOW()), ($6, ...), ...
            const placeholders = userIds.map((_, index) => {
                const offset = index * 5;
                return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, NOW())`;
            }).join(", ");

            const query = `
                INSERT INTO notifications (user_id, title, body, type, data, created_at)
                VALUES ${placeholders}
                RETURNING *;
            `;

            const values: any[] = [];
            userIds.forEach(uid => {
                values.push(uid, title, body, type, data);
            });

            const result = await pool.query(query, values);
            const notifications = result.rows;

            // 2. Emit Real-time Events
            // Since we can't easily batch socket emits to *different* private rooms in one go 
            // without a custom room logic, we'll loop. 500 emits is trivial for Socket.IO.
            // We do this asynchronously so we don't block the return.
            Promise.all(notifications.map(n => {
                sendToUser(n.user_id, 'notification', {
                    id: n.id,
                    title: n.title,
                    body: n.body,
                    type: n.type,
                    timestamp: n.created_at,
                    data: n.data
                });
            })).catch(err => console.error("Error broadcasting socket events:", err));

            return notifications;

        } catch (error) {
            console.error("Error sending bulk notifications:", error);
            throw error;
        }
    }

    /**
     * Get user's notification history
     */
    static async getUserNotifications(userId: string, limit = 50, offset = 0) {
        const query = `
            SELECT * FROM notifications 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT $2 OFFSET $3
        `;
        const result = await pool.query(query, [userId, limit, offset]);

        // Get unread count
        const countQuery = `SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = $1 AND is_read = false`;
        const countResult = await pool.query(countQuery, [userId]);

        return {
            notifications: result.rows,
            unreadCount: parseInt(countResult.rows[0].unread_count || '0')
        };
    }

    /**
     * Mark a notification as read
     */
    static async markAsRead(notificationId: string, userId: string) {
        const query = `
            UPDATE notifications 
            SET is_read = true 
            WHERE id = $1 AND user_id = $2
            RETURNING *
        `;
        const result = await pool.query(query, [notificationId, userId]);
        return result.rows[0];
    }

    /**
     * Mark all notifications as read for a user
     */
    static async markAllAsRead(userId: string) {
        const query = `
            UPDATE notifications 
            SET is_read = true 
            WHERE user_id = $1 AND is_read = false
        `;
        await pool.query(query, [userId]);
        return { success: true };
    }
}
