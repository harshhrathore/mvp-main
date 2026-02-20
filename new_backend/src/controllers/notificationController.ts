import { NotificationService } from "../services/notificationService";
import { Request, Response } from "express";

interface AuthRequest extends Request {
    user?: {
        userId: string;
    }
}

export const notificationController = {
    // Get all notifications for the authenticated user
    getNotifications: async (req: Request, res: Response) => {
        try {
            // Cast to AuthRequest or use any if TS complains about user property
            const userId = (req as AuthRequest).user?.userId;

            if (!userId) {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const { limit = 50, offset = 0 } = req.query;

            const result = await NotificationService.getUserNotifications(
                userId,
                parseInt(limit as string),
                parseInt(offset as string)
            );

            res.json(result);
        } catch (error) {
            console.error("Error fetching notifications:", error);
            res.status(500).json({ error: "Failed to fetch notifications" });
        }
    },

    // Mark a single notification as read
    markRead: async (req: Request, res: Response) => {
        try {
            const userId = (req as AuthRequest).user?.userId;
            if (!userId) return res.status(401).json({ error: "Unauthorized" });

            const { id } = req.params;

            const updated = await NotificationService.markAsRead(id, userId);

            if (!updated) {
                return res.status(404).json({ error: "Notification not found" });
            }

            res.json(updated);
        } catch (error) {
            console.error("Error marking notification read:", error);
            res.status(500).json({ error: "Failed to mark as read" });
        }
    },

    // Mark all as read
    markAllRead: async (req: Request, res: Response) => {
        try {
            const userId = (req as AuthRequest).user?.userId;
            if (!userId) return res.status(401).json({ error: "Unauthorized" });

            await NotificationService.markAllAsRead(userId);
            res.json({ success: true });
        } catch (error) {
            console.error("Error marking all read:", error);
            res.status(500).json({ error: "Failed to mark all as read" });
        }
    },

    // Send a test notification (Development/Testing only)
    sendNotification: async (req: Request, res: Response) => {
        try {
            const { userId, title, body, type, data } = req.body;

            const notification = await NotificationService.sendNotification({
                userId,
                title,
                body,
                type,
                data
            });

            res.status(201).json(notification);
        } catch (error) {
            console.error("Error sending notification:", error);
            res.status(500).json({ error: "Failed to send notification" });
        }
    },

    // Send bulk notifications (Admin only ideally)
    sendBulk: async (req: Request, res: Response) => {
        try {
            const { userIds, title, body, type, data } = req.body;

            if (!Array.isArray(userIds) || userIds.length === 0) {
                return res.status(400).json({ error: "No userIds provided" });
            }

            if (userIds.length > 500) {
                return res.status(400).json({ error: "Cannot send to more than 500 users at once" });
            }

            // Send asynchronously to not block response
            NotificationService.sendBulkNotifications(userIds, title, body, type, data)
                .catch(err => console.error("Async bulk send error:", err));

            res.json({ message: `Queued notifications for ${userIds.length} users` });
        } catch (error) {
            console.error("Error initiating bulk notifications:", error);
            res.status(500).json({ error: "Failed to initiate bulk send" });
        }
    }
};
