/**
 * Blog Routes
 */

import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
    getAllPosts,
    getPostBySlug,
    getFeaturedPosts,
    toggleLike,
    recordView,
    createPost
} from '../controllers/blogController';

const router = Router();

// Public routes
router.get('/posts', getAllPosts);
router.get('/posts/featured', getFeaturedPosts);
router.get('/posts/:slug', getPostBySlug);

// Protected routes
router.post('/posts/:postId/like', protect, toggleLike);
router.post('/posts/:postId/view', protect, recordView);

// Admin routes (TODO: Add admin middleware)
router.post('/posts', protect, createPost);

export default router;
