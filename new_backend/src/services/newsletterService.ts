/**
 * Newsletter Service
 * Handles newsletter subscriptions and email campaigns
 */

import { pool } from '../config/db';
import { NewsletterSubscriber, CreateNewsletterSubscriptionDto } from '../types/productionFeatures';
import { emailService } from './emailService';
import crypto from 'crypto';

export class NewsletterService {
  /**
   * Subscribe to newsletter
   */
  static async subscribe(data: CreateNewsletterSubscriptionDto, userId?: string): Promise<NewsletterSubscriber> {
    const confirmationToken = crypto.randomBytes(32).toString('hex');

    const query = `
      INSERT INTO newsletter_subscribers (
        email, user_id, full_name, interests, confirmation_token, confirmation_sent_at
      )
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (email)
      DO UPDATE SET
        full_name = EXCLUDED.full_name,
        interests = EXCLUDED.interests,
        status = CASE WHEN newsletter_subscribers.status = 'unsubscribed' THEN 'pending' ELSE newsletter_subscribers.status END
      RETURNING *
    `;

    const result = await pool.query(query, [
      data.email.toLowerCase(),
      userId || null,
      data.full_name || null,
      data.interests || [],
      confirmationToken
    ]);

    const subscriber = result.rows[0];

    // Send confirmation email
    try {
      await this.sendConfirmationEmail(subscriber);
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
    }

    return subscriber;
  }

  /**
   * Confirm subscription via token
   */
  static async confirmSubscription(token: string): Promise<NewsletterSubscriber | null> {
    const query = `
      UPDATE newsletter_subscribers
      SET 
        confirmed = true,
        confirmed_at = CURRENT_TIMESTAMP,
        status = 'active'
      WHERE confirmation_token = $1
        AND status = 'pending'
      RETURNING *
    `;

    const result = await pool.query(query, [token]);
    return result.rows[0] || null;
  }

  /**
   * Unsubscribe from newsletter
   */
  static async unsubscribe(email: string, reason?: string): Promise<boolean> {
    const query = `
      UPDATE newsletter_subscribers
      SET 
        status = 'unsubscribed',
        unsubscribed_at = CURRENT_TIMESTAMP,
        unsubscribe_reason = $2
      WHERE email = $1
        AND status != 'unsubscribed'
      RETURNING *
    `;

    const result = await pool.query(query, [email.toLowerCase(), reason]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Get subscriber by email
   */
  static async getSubscriber(email: string): Promise<NewsletterSubscriber | null> {
    const query = `SELECT * FROM newsletter_subscribers WHERE email = $1`;
    const result = await pool.query(query, [email.toLowerCase()]);
    return result.rows[0] || null;
  }

  /**
   * Get all active subscribers
   */
  static async getActiveSubscribers(limit?: number, offset: number = 0): Promise<NewsletterSubscriber[]> {
    const query = `
      SELECT * FROM newsletter_subscribers
      WHERE status = 'active' AND confirmed = true
      ORDER BY subscribed_at DESC
      ${limit ? `LIMIT $1 OFFSET $2` : ''}
    `;

    const params = limit ? [limit, offset] : [];
    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Update subscriber preferences
   */
  static async updatePreferences(
    email: string,
    preferences: { frequency?: string; interests?: string[] }
  ): Promise<NewsletterSubscriber | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (preferences.frequency) {
      updates.push(`frequency = $${paramIndex++}`);
      values.push(preferences.frequency);
    }
    if (preferences.interests) {
      updates.push(`interests = $${paramIndex++}`);
      values.push(preferences.interests);
    }

    if (updates.length === 0) return null;

    values.push(email.toLowerCase());

    const query = `
      UPDATE newsletter_subscribers
      SET ${updates.join(', ')}
      WHERE email = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Record email open
   */
  static async recordEmailOpen(campaignId: string, subscriberId: string): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update engagement record
      await client.query(`
        UPDATE newsletter_engagement
        SET 
          opened = true,
          first_opened_at = COALESCE(first_opened_at, CURRENT_TIMESTAMP),
          open_count = open_count + 1,
          last_opened_at = CURRENT_TIMESTAMP
        WHERE campaign_id = $1 AND subscriber_id = $2
      `, [campaignId, subscriberId]);

      // Update subscriber stats
      await client.query(`
        UPDATE newsletter_subscribers
        SET 
          emails_opened = emails_opened + 1,
          last_email_opened_at = CURRENT_TIMESTAMP
        WHERE subscriber_id = $1
      `, [subscriberId]);

      // Update campaign stats
      await client.query(`
        UPDATE newsletter_campaigns
        SET opened_count = (
          SELECT COUNT(DISTINCT subscriber_id)
          FROM newsletter_engagement
          WHERE campaign_id = $1 AND opened = true
        )
        WHERE campaign_id = $1
      `, [campaignId]);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get newsletter statistics
   */
  static async getStatistics(): Promise<any> {
    const query = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'active' AND confirmed = true) as active_subscribers,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_subscribers,
        COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed_count,
        AVG(emails_opened::float / NULLIF(emails_sent, 0)) as avg_open_rate
      FROM newsletter_subscribers
    `;

    const result = await pool.query(query);
    return result.rows[0];
  }

  /**
   * Send confirmation email
   */
  private static async sendConfirmationEmail(subscriber: NewsletterSubscriber): Promise<void> {
    const confirmUrl = `${process.env.FRONTEND_URL}/newsletter/confirm/${subscriber.confirmation_token}`;

    await emailService.sendEmail({
      to: subscriber.email,
      subject: 'Confirm Your Newsletter Subscription',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7f957e;">Welcome to Sama Wellness!</h2>
          <p>Thank you for subscribing to our newsletter.</p>
          <p>Please confirm your subscription by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmUrl}" 
               style="background-color: #7f957e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Confirm Subscription
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you didn't subscribe to this newsletter, you can safely ignore this email.
          </p>
        </div>
      `
    });
  }
}
