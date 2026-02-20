/**
 * Contact Service
 * Handles contact form submissions and support tickets
 */

import { pool } from '../config/db';
import { ContactSubmission, CreateContactSubmissionDto } from '../types/productionFeatures';
import { emailService } from './emailService';

export class ContactService {
    /**
     * Create new contact submission
     */
    static async createSubmission(
        data: CreateContactSubmissionDto,
        userId?: string,
        metadata?: { userAgent?: string; ipAddress?: string; referringUrl?: string }
    ): Promise<ContactSubmission> {
        const query = `
      INSERT INTO contact_submissions (
        user_id, contact_name, contact_email, contact_phone,
        subject, message, category, priority,
        user_agent, ip_address, referring_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

        const result = await pool.query(query, [
            userId || null,
            data.contact_name || null,
            data.contact_email || null,
            data.contact_phone || null,
            data.subject,
            data.message,
            data.category,
            'normal', // default priority
            metadata?.userAgent || null,
            metadata?.ipAddress || null,
            metadata?.referringUrl || null
        ]);

        const submission = result.rows[0];

        // Send notification email to admin
        try {
            await this.sendSubmissionNotification(submission);
        } catch (error) {
            console.error('Failed to send contact notification email:', error);
        }

        return submission;
    }

    /**
     * Get all submissions (admin)
     */
    static async getAllSubmissions(
        status?: string,
        limit: number = 50,
        offset: number = 0
    ): Promise<ContactSubmission[]> {
        let query = `
      SELECT 
        cs.*,
        u.full_name as user_full_name,
        u.email as user_email
      FROM contact_submissions cs
      LEFT JOIN users u ON cs.user_id = u.id
    `;

        const params: any[] = [];
        if (status) {
            query += ` WHERE cs.status = $1`;
            params.push(status);
        }

        query += ` ORDER BY cs.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);
        return result.rows;
    }

    /**
     * Get user's own submissions
     */
    static async getUserSubmissions(userId: string): Promise<ContactSubmission[]> {
        const query = `
      SELECT * FROM contact_submissions
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

        const result = await pool.query(query, [userId]);
        return result.rows;
    }

    /**
     * Update submission status
     */
    static async updateStatus(
        submissionId: string,
        status: string,
        responseText?: string,
        respondedBy?: string
    ): Promise<ContactSubmission> {
        const query = `
      UPDATE contact_submissions
      SET 
        status = $1,
        response_text = $2,
        responded_by = $3,
        responded_at = CASE WHEN $2 IS NOT NULL THEN CURRENT_TIMESTAMP ELSE responded_at END,
        resolved_at = CASE WHEN $1 IN ('resolved', 'closed') THEN CURRENT_TIMESTAMP ELSE resolved_at END
      WHERE submission_id = $4
      RETURNING *
    `;

        const result = await pool.query(query, [status, responseText, respondedBy, submissionId]);
        const submission = result.rows[0];

        // Send response email if response text provided
        if (responseText && submission.contact_email) {
            try {
                await this.sendResponseEmail(submission, responseText);
            } catch (error) {
                console.error('Failed to send response email:', error);
            }
        }

        return submission;
    }

    /**
     * Send notification to admin about new submission
     */
    private static async sendSubmissionNotification(submission: ContactSubmission): Promise<void> {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@sama.com';

        await emailService.sendEmail({
            to: adminEmail,
            subject: `New Contact Submission: ${submission.subject}`,
            html: `
        <h2>New Contact Submission</h2>
        <p><strong>From:</strong> ${submission.contact_name || 'Unknown'} (${submission.contact_email})</p>
        <p><strong>Category:</strong> ${submission.category}</p>
        <p><strong>Subject:</strong> ${submission.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${submission.message}</p>
        <p><strong>Submitted at:</strong> ${submission.created_at}</p>
      `
        });
    }

    /**
     * Send response email to user
     */
    private static async sendResponseEmail(submission: ContactSubmission, responseText: string): Promise<void> {
        if (!submission.contact_email) return;

        await emailService.sendEmail({
            to: submission.contact_email,
            subject: `Re: ${submission.subject}`,
            html: `
        <h2>Response to Your Inquiry</h2>
        <p>Hello ${submission.contact_name || 'there'},</p>
        <p>Thank you for contacting us. Here's our response to your inquiry:</p>
        <div style="padding: 15px; background: #f5f5f5; border-left: 4px solid #7f957e;">
          ${responseText}
        </div>
        <p>If you have any further questions, please don't hesitate to reach out.</p>
        <p>Best regards,<br>Sama Wellness Team</p>
      `
        });
    }

    /**
     * Get submission by ID
     */
    static async getSubmissionById(submissionId: string): Promise<ContactSubmission | null> {
        const query = `SELECT * FROM contact_submissions WHERE submission_id = $1`;
        const result = await pool.query(query, [submissionId]);
        return result.rows[0] || null;
    }

    /**
     * Delete submission (soft delete by updating status)
     */
    static async deleteSubmission(submissionId: string): Promise<void> {
        await pool.query(
            `UPDATE contact_submissions SET status = 'closed' WHERE submission_id = $1`,
            [submissionId]
        );
    }
}
