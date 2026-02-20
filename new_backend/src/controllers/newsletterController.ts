/**
 * Newsletter Controller
 */

import { Request, Response, NextFunction } from 'express';
import { NewsletterService } from '../services/newsletterService';

export const subscribe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;
        const subscriber = await NewsletterService.subscribe(req.body, userId);

        res.status(201).json({
            success: true,
            data: subscriber,
            message: 'Subscription successful! Please check your email to confirm.'
        });
    } catch (error) {
        next(error);
    }
};

export const confirmSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.params;
        const subscriber = await NewsletterService.confirmSubscription(token);

        if (!subscriber) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired confirmation token'
            });
        }

        res.status(200).json({
            success: true,
            data: subscriber,
            message: 'Email confirmed successfully! You are now subscribed.'
        });
    } catch (error) {
        next(error);
    }
};

export const unsubscribe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        const { reason } = req.body;

        const success = await NewsletterService.unsubscribe(email, reason);

        if (!success) {
            return res.status(404).json({
                success: false,
                message: 'Email not found or already unsubscribed'
            });
        }

        res.status(200).json({
            success: true,
            message: 'You have been unsubscribed successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getSubscriber = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.params;
        const subscriber = await NewsletterService.getSubscriber(email);

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: 'Subscriber not found'
            });
        }

        res.status(200).json({
            success: true,
            data: subscriber
        });
    } catch (error) {
        next(error);
    }
};

export const updatePreferences = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.params;
        const subscriber = await NewsletterService.updatePreferences(email, req.body);

        if (!subscriber) {
            return res.status(404).json({
                success: false,
                message: 'Subscriber not found'
            });
        }

        res.status(200).json({
            success: true,
            data: subscriber,
            message: 'Preferences updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const trackEmailOpen = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { campaignId, subscriberId } = req.params;
        await NewsletterService.recordEmailOpen(campaignId, subscriberId);

        // Return 1x1 transparent pixel
        const pixel = Buffer.from(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            'base64'
        );

        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': pixel.length
        });
        res.end(pixel);
    } catch (error) {
        next(error);
    }
};

export const getStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await NewsletterService.getStatistics();

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

export const getAllSubscribers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = parseInt(req.query.limit as string) || 100;
        const offset = parseInt(req.query.offset as string) || 0;

        const subscribers = await NewsletterService.getActiveSubscribers(limit, offset);

        res.status(200).json({
            success: true,
            data: subscribers,
            pagination: {
                limit,
                offset,
                hasMore: subscribers.length === limit
            }
        });
    } catch (error) {
        next(error);
    }
};
