/**
 * Profile Service
 * Enhanced user profile management
 */

import { pool } from '../config/db';
import { UserProfile, UpdateProfileDto, ProfileActivityLog } from '../types/productionFeatures';

export class ProfileService {
    /**
     * Get or create user profile
     */
    static async getProfile(userId: string): Promise<UserProfile> {
        let query = `SELECT * FROM user_profiles WHERE user_id = $1`;
        let result = await pool.query(query, [userId]);

        if (result.rows.length === 0) {
            // Create default profile
            query = `
        INSERT INTO user_profiles (user_id)
        VALUES ($1)
        RETURNING *
      `;
            result = await pool.query(query, [userId]);
        }

        return result.rows[0];
    }

    /**
     * Update user profile
     */
    static async updateProfile(userId: string, data: UpdateProfileDto): Promise<UserProfile> {
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        // Build dynamic update query
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                updates.push(`${key} = $${paramIndex++}`);
                values.push(value);
            }
        });

        if (updates.length === 0) {
            return this.getProfile(userId);
        }

        values.push(userId);

        const query = `
      UPDATE user_profiles
      SET ${updates.join(', ')}
      WHERE user_id = $${paramIndex}
      RETURNING *
    `;

        const result = await pool.query(query, values);

        // Log activity
        await this.logActivity(userId, 'profile_updated', data);

        return result.rows[0];
    }

    /**
     * Upload profile photo
     */
    static async updateProfilePhoto(userId: string, photoUrl: string): Promise<UserProfile> {
        const query = `
      UPDATE user_profiles
      SET profile_photo_url = $1
      WHERE user_id = $2
      RETURNING *
    `;

        const result = await pool.query(query, [photoUrl, userId]);

        await this.logActivity(userId, 'profile_photo_updated', { photoUrl });

        return result.rows[0];
    }

    /**
     * Upload cover photo
     */
    static async updateCoverPhoto(userId: string, photoUrl: string): Promise<UserProfile> {
        const query = `
      UPDATE user_profiles
      SET cover_photo_url = $1
      WHERE user_id = $2
      RETURNING *
    `;

        const result = await pool.query(query, [photoUrl, userId]);

        await this.logActivity(userId, 'cover_photo_updated', { photoUrl });

        return result.rows[0];
    }

    /**
     * Get complete user profile (with user data)
     */
    static async getCompleteProfile(userId: string): Promise<any> {
        const query = `
      SELECT 
        u.*,
        up.*,
        uo.step_1_completed,
        uo.step_2_completed,
        uo.step_3_completed,
        uo.health_baseline,
        da.primary_dosha,
        da.secondary_dosha,
        da.prakriti_scores,
        da.assessed_at as dosha_assessed_at,
        us.current_streak,
        us.longest_streak,
        us.last_active_date,
        upref.voice_gender,
        upref.speaking_speed,
        upref.preferred_language,
        upref.morning_reminder,
        upref.evening_checkin
      FROM users u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      LEFT JOIN user_onboarding uo ON u.id = uo.user_id
      LEFT JOIN dosha_assessment da ON u.id = da.user_id
      LEFT JOIN user_streaks us ON u.id = us.user_id
      LEFT JOIN user_preferences upref ON u.id = upref.user_id
      WHERE u.id = $1
    `;

        const result = await pool.query(query, [userId]);
        return result.rows[0] || null;
    }

    /**
     * Update basic user info
     */
    static async updateUserInfo(
        userId: string,
        data: { full_name?: string; phone?: string; birth_date?: string; gender?: string }
    ): Promise<any> {
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                updates.push(`${key} = $${paramIndex++}`);
                values.push(value);
            }
        });

        if (updates.length === 0) {
            return null;
        }

        values.push(userId);

        const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

        const result = await pool.query(query, values);

        await this.logActivity(userId, 'user_info_updated', data);

        return result.rows[0];
    }

    /**
     * Log profile activity
     */
    static async logActivity(
        userId: string,
        activityType: string,
        activityData?: any,
        metadata?: { ipAddress?: string; userAgent?: string }
    ): Promise<void> {
        const query = `
      INSERT INTO profile_activity_log (
        user_id, activity_type, activity_data, ip_address, user_agent
      )
      VALUES ($1, $2, $3, $4, $5)
    `;

        await pool.query(query, [
            userId,
            activityType,
            activityData || null,
            metadata?.ipAddress || null,
            metadata?.userAgent || null
        ]);
    }

    /**
     * Get profile activity history
     */
    static async getActivityHistory(userId: string, limit: number = 50): Promise<ProfileActivityLog[]> {
        const query = `
      SELECT * FROM profile_activity_log
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

        const result = await pool.query(query, [userId, limit]);
        return result.rows;
    }

    /**
     * Delete user profile (soft delete by hiding)
     */
    static async deleteProfile(userId: string): Promise<void> {
        await pool.query(
            `UPDATE user_profiles SET profile_visibility = 'private' WHERE user_id = $1`,
            [userId]
        );

        await this.logActivity(userId, 'profile_deleted');
    }

    /**
     * Get profile statistics
     */
    static async getProfileStats(userId: string): Promise<any> {
        const query = `
      SELECT
        (SELECT COUNT(*) FROM conversation_sessions WHERE user_id = $1) as total_conversations,
        (SELECT COUNT(*) FROM recommendation_history WHERE user_id = $1 AND completed = true) as completed_practices,
        (SELECT current_streak FROM user_streaks WHERE user_id = $1) as current_streak,
        (SELECT COUNT(*) FROM blog_engagement WHERE user_id = $1 AND liked = true) as liked_posts,
        (SELECT COUNT(*) FROM blog_engagement WHERE user_id = $1 AND bookmarked = true) as bookmarked_posts
    `;

        const result = await pool.query(query, [userId]);
        return result.rows[0];
    }
}
