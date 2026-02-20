/**
 * Email Verification Token Service
 */

import crypto from 'crypto';
import { pool } from '../config/db';

/**
 * Generate a random verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Store verification token in database
 */
export async function storeVerificationToken(
  userId: string,
  token: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await pool.query(
    `UPDATE user_authentication 
     SET email_verification_token = $1, 
         email_verification_expires = $2,
         email_verified = false
     WHERE user_id = $3`,
    [token, expiresAt, userId]
  );
}

/**
 * Verify email with token
 */
export async function verifyEmailToken(token: string): Promise<{ userId: string; email: string; full_name: string } | null> {
  const result = await pool.query(
    `SELECT ua.user_id, u.email, u.full_name
     FROM user_authentication ua
     JOIN users u ON ua.user_id = u.id
     WHERE ua.email_verification_token = $1
       AND ua.email_verification_expires > NOW()
       AND ua.email_verified = false`,
    [token]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const { user_id, email, full_name } = result.rows[0];

  // Mark email as verified
  await pool.query(
    `UPDATE user_authentication 
     SET email_verified = true,
         email_verification_token = NULL,
         email_verification_expires = NULL
     WHERE user_id = $1`,
    [user_id]
  );

  return { userId: user_id, email, full_name };
}

/**
 * Check if user's email is verified
 */
export async function isEmailVerified(userId: string): Promise<boolean> {
  const result = await pool.query(
    `SELECT email_verified FROM user_authentication WHERE user_id = $1`,
    [userId]
  );

  return result.rows[0]?.email_verified || false;
}

/**
 * Get verification token for user (for resending)
 */
export async function getVerificationToken(email: string): Promise<string | null> {
  const result = await pool.query(
    `SELECT ua.email_verification_token, ua.email_verified
     FROM user_authentication ua
     JOIN users u ON ua.user_id = u.id
     WHERE u.email = $1`,
    [email]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const { email_verification_token, email_verified } = result.rows[0];

  // If already verified, return null
  if (email_verified) {
    return null;
  }

  return email_verification_token;
}
