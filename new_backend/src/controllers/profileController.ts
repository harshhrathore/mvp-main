/**
 * Profile Controller
 */

import { Request, Response, NextFunction } from 'express';
import { ProfileService } from '../services/profileService';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const profile = await ProfileService.getProfile(userId);

        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        next(error);
    }
};

export const getCompleteProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const profile = await ProfileService.getCompleteProfile(userId);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Profile not found'
            });
        }

        res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const profile = await ProfileService.updateProfile(userId, req.body);

        res.status(200).json({
            success: true,
            data: profile,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const updateUserInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const user = await ProfileService.updateUserInfo(userId, req.body);

        res.status(200).json({
            success: true,
            data: user,
            message: 'User information updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfilePhoto = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { photoUrl } = req.body;

        if (!photoUrl) {
            return res.status(400).json({
                success: false,
                message: 'Photo URL is required'
            });
        }

        const profile = await ProfileService.updateProfilePhoto(userId, photoUrl);

        res.status(200).json({
            success: true,
            data: profile,
            message: 'Profile photo updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const updateCoverPhoto = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { photoUrl } = req.body;

        if (!photoUrl) {
            return res.status(400).json({
                success: false,
                message: 'Photo URL is required'
            });
        }

        const profile = await ProfileService.updateCoverPhoto(userId, photoUrl);

        res.status(200).json({
            success: true,
            data: profile,
            message: 'Cover photo updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getActivityHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const limit = parseInt(req.query.limit as string) || 50;

        const history = await ProfileService.getActivityHistory(userId, limit);

        res.status(200).json({
            success: true,
            data: history
        });
    } catch (error) {
        next(error);
    }
};

export const getProfileStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const stats = await ProfileService.getProfileStats(userId);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        await ProfileService.deleteProfile(userId);

        res.status(200).json({
            success: true,
            message: 'Profile deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
