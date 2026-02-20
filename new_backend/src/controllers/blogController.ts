/**
 * Blog Controller
 */

import { Request, Response, NextFunction } from 'express';
import { BlogService } from '../services/blogService';

export const getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        const posts = await BlogService.getPublishedPosts(limit, offset);

        res.status(200).json({
            success: true,
            data: posts,
            pagination: {
                limit,
                offset,
                hasMore: posts.length === limit
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getPostBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const userId = (req as any).user?.id;

        const post = await BlogService.getPostBySlug(slug, userId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        // Record view
        await BlogService.recordView(post.post_id, userId);

        res.status(200).json({
            success: true,
            data: post
        });
    } catch (error) {
        next(error);
    }
};

export const getFeaturedPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const posts = await BlogService.getFeaturedPosts();

        res.status(200).json({
            success: true,
            data: posts
        });
    } catch (error) {
        next(error);
    }
};

export const toggleLike = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { postId } = req.params;
        const userId = (req as any).user.id;

        const result = await BlogService.toggleLike(postId, userId);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const recordView = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { postId } = req.params;
        const { viewDuration } = req.body;
        const userId = (req as any).user?.id;

        await BlogService.recordView(postId, userId, viewDuration);

        res.status(200).json({
            success: true,
            message: 'View recorded'
        });
    } catch (error) {
        next(error);
    }
};

export const createPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authorId = (req as any).user.id;
        const post = await BlogService.createPost(req.body, authorId);

        res.status(201).json({
            success: true,
            data: post,
            message: 'Blog post created successfully'
        });
    } catch (error) {
        next(error);
    }
};
