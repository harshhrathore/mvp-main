/**
 * Contact Controller
 */

import { Request, Response, NextFunction } from 'express';
import { ContactService } from '../services/contactService';

export const submitContactForm = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;
        const referringHeader = req.headers.referer || req.headers.referrer;
        const referringUrl = Array.isArray(referringHeader) ? referringHeader[0] : referringHeader;

        const metadata = {
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip || req.connection.remoteAddress,
            referringUrl
        };

        const submission = await ContactService.createSubmission(req.body, userId, metadata);

        res.status(201).json({
            success: true,
            data: submission,
            message: 'Your message has been submitted successfully. We will get back to you soon.'
        });
    } catch (error) {
        next(error);
    }
};

export const getUserSubmissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const submissions = await ContactService.getUserSubmissions(userId);

        res.status(200).json({
            success: true,
            data: submissions
        });
    } catch (error) {
        next(error);
    }
};

export const getAllSubmissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = req.query.status as string;
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = parseInt(req.query.offset as string) || 0;

        const submissions = await ContactService.getAllSubmissions(status, limit, offset);

        res.status(200).json({
            success: true,
            data: submissions,
            pagination: {
                limit,
                offset,
                hasMore: submissions.length === limit
            }
        });
    } catch (error) {
        next(error);
    }
};

export const updateSubmissionStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { submissionId } = req.params;
        const { status, responseText } = req.body;
        const respondedBy = (req as any).user.id;

        const submission = await ContactService.updateStatus(
            submissionId,
            status,
            responseText,
            respondedBy
        );

        res.status(200).json({
            success: true,
            data: submission,
            message: 'Submission updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getSubmissionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { submissionId } = req.params;
        const submission = await ContactService.getSubmissionById(submissionId);

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        res.status(200).json({
            success: true,
            data: submission
        });
    } catch (error) {
        next(error);
    }
};

export const deleteSubmission = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { submissionId } = req.params;
        await ContactService.deleteSubmission(submissionId);

        res.status(200).json({
            success: true,
            message: 'Submission deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};
