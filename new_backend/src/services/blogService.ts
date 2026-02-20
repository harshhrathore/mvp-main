/**
 * Blog Service
 * Handles blog posts, engagement, and content management
 */

import { pool } from '../config/db';
import { BlogPost, CreateBlogPostDto, BlogEngagement } from '../types/productionFeatures';

export class BlogService {
    /**
     * Get all published blog posts
     */
    static async getPublishedPosts(limit: number = 20, offset: number = 0): Promise<BlogPost[]> {
        const query = `
      SELECT 
        bp.*,
        COALESCE(
          json_agg(
            json_build_object(
              'takeaway_text', bt.takeaway_text,
              'display_order', bt.display_order
            ) ORDER BY bt.display_order
          ) FILTER (WHERE bt.takeaway_id IS NOT NULL),
          '[]'
        ) as takeaways
      FROM blog_posts bp
      LEFT JOIN blog_takeaways bt ON bp.post_id = bt.post_id
      WHERE bp.status = 'published'
        AND bp.published_at <= CURRENT_TIMESTAMP
      GROUP BY bp.post_id
      ORDER BY bp.published_at DESC
      LIMIT $1 OFFSET $2
    `;

        const result = await pool.query(query, [limit, offset]);
        return result.rows;
    }

    /**
     * Get single blog post by slug
     */
    static async getPostBySlug(slug: string, userId?: string): Promise<BlogPost | null> {
        const query = `
      SELECT 
        bp.*,
        COALESCE(
          json_agg(
            json_build_object(
              'takeaway_text', bt.takeaway_text,
              'display_order', bt.display_order
            ) ORDER BY bt.display_order
          ) FILTER (WHERE bt.takeaway_id IS NOT NULL),
          '[]'
        ) as takeaways,
        CASE WHEN $2::uuid IS NOT NULL THEN
          (SELECT liked FROM blog_engagement WHERE post_id = bp.post_id AND user_id = $2::uuid)
        ELSE false END as user_liked,
        CASE WHEN $2::uuid IS NOT NULL THEN
          (SELECT bookmarked FROM blog_engagement WHERE post_id = bp.post_id AND user_id = $2::uuid)
        ELSE false END as user_bookmarked
      FROM blog_posts bp
      LEFT JOIN blog_takeaways bt ON bp.post_id = bt.post_id
      WHERE bp.slug = $1
        AND bp.status = 'published'
      GROUP BY bp.post_id
    `;

        const result = await pool.query(query, [slug, userId || null]);
        return result.rows[0] || null;
    }

    /**
     * Get featured blog posts
     */
    static async getFeaturedPosts(): Promise<BlogPost[]> {
        const query = `
      SELECT bp.*
      FROM blog_posts bp
      WHERE bp.status = 'published'
        AND bp.featured = true
        AND bp.published_at <= CURRENT_TIMESTAMP
      ORDER BY bp.published_at DESC
      LIMIT 5
    `;

        const result = await pool.query(query);
        return result.rows;
    }

    /**
     * Record blog post view
     */
    static async recordView(postId: string, userId?: string, viewDuration?: number): Promise<void> {
        // Increment view count
        await pool.query(
            `UPDATE blog_posts SET views_count = views_count + 1 WHERE post_id = $1`,
            [postId]
        );

        // Track user engagement if authenticated
        if (userId) {
            const query = `
        INSERT INTO blog_engagement (post_id, user_id, viewed, view_duration_seconds, first_viewed_at, last_viewed_at)
        VALUES ($1, $2, true, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (post_id, user_id)
        DO UPDATE SET
          viewed = true,
          view_duration_seconds = EXCLUDED.view_duration_seconds,
          last_viewed_at = CURRENT_TIMESTAMP
      `;
            await pool.query(query, [postId, userId, viewDuration]);
        }
    }

    /**
     * Toggle like on blog post
     */
    static async toggleLike(postId: string, userId: string): Promise<{ liked: boolean }> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Check current state
            const checkQuery = `
        SELECT liked FROM blog_engagement
        WHERE post_id = $1 AND user_id = $2
      `;
            const checkResult = await client.query(checkQuery, [postId, userId]);

            const currentlyLiked = checkResult.rows[0]?.liked || false;
            const newLikedState = !currentlyLiked;

            // Update engagement
            const updateEngagementQuery = `
        INSERT INTO blog_engagement (post_id, user_id, liked)
        VALUES ($1, $2, $3)
        ON CONFLICT (post_id, user_id)
        DO UPDATE SET liked = $3
      `;
            await client.query(updateEngagementQuery, [postId, userId, newLikedState]);

            // Update post likes count
            const updatePostQuery = newLikedState
                ? `UPDATE blog_posts SET likes_count = likes_count + 1 WHERE post_id = $1`
                : `UPDATE blog_posts SET likes_count = likes_count - 1 WHERE post_id = $1`;
            await client.query(updatePostQuery, [postId]);

            await client.query('COMMIT');
            return { liked: newLikedState };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Create new blog post (admin)
     */
    static async createPost(data: CreateBlogPostDto, authorId: string): Promise<BlogPost> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Insert post
            const postQuery = `
        INSERT INTO blog_posts (
          title, slug, excerpt, content, author_id, category, tags,
          featured, meta_description, featured_image_url, image_alt_text, read_time_minutes,
          status, published_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'published', CURRENT_TIMESTAMP)
        RETURNING *
      `;

            const postResult = await client.query(postQuery, [
                data.title,
                data.slug,
                data.excerpt,
                data.content,
                authorId,
                data.category,
                data.tags || [],
                data.featured || false,
                data.meta_description,
                data.featured_image_url,
                data.image_alt_text,
                data.read_time_minutes
            ]);

            const post = postResult.rows[0];

            // Insert takeaways if provided
            if (data.takeaways && data.takeaways.length > 0) {
                for (let i = 0; i < data.takeaways.length; i++) {
                    await client.query(
                        `INSERT INTO blog_takeaways (post_id, takeaway_text, display_order) VALUES ($1, $2, $3)`,
                        [post.post_id, data.takeaways[i], i + 1]
                    );
                }
            }

            await client.query('COMMIT');
            return post;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}
