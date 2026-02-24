/**
 * Email Service using Nodemailer with Hostinger SMTP
 * Uses port 465 (SSL) which works on Railway
 */

import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { ensureEnv } from '../config/env';

// Ensure env variables are loaded
ensureEnv();

let transporter: Transporter | null = null;

// Check for Hostinger SMTP credentials
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

if (smtpHost && smtpPort && smtpUser && smtpPass) {
  // Use Hostinger SMTP (works on Railway - port 465 SSL)
  console.log('📧 Initializing Hostinger SMTP email service...');
  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: true, // true for port 465 (SSL)
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false, // For Railway compatibility
    },
  });
  console.log('✅ Hostinger SMTP email service ready');
} else {
  console.warn(
    '⚠️ Email credentials not configured. Email service will run in MOCK mode (logging to console).'
  );
  console.warn('💡 For Railway deployment, set these environment variables:');
  console.warn('   SMTP_HOST=smtp.hostinger.com');
  console.warn('   SMTP_PORT=465');
  console.warn('   SMTP_USER=noreply@samawellness.ai');
  console.warn('   SMTP_PASS=your_hostinger_password');
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email using nodemailer or mock logger
 */
export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<void> {
  if (!transporter) {
    console.log(
      `\n[MOCK EMAIL] To: ${to}\nSubject: ${subject}\nContent-Length: ${html.length} chars\n`
    );
    return;
  }

  const fromEmail = process.env.SMTP_USER;
  const mailOptions = {
    from: `"SAMA Wellness" <${fromEmail}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Verification email sent to ${to}`);
    console.log(`✅ Message ID: ${info.messageId}`);
  } catch (error: any) {
    console.error('❌ Email sending failed:', error.message);
    throw new Error('Failed to send email');
  }
}

// Export as service object for compatibility
export const emailService = {
  sendEmail,
};

/**
 * Generate email verification HTML template
 */
export function generateVerificationEmail(userName: string, verificationLink: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - SAMA Wellness</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #F9F7F4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9F7F4; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #F5BDA6 0%, #A7CDA9 100%); border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center;">
                  <h1 style="margin: 0; color: #1E1E1E; font-size: 32px; font-weight: normal;">
                    Welcome to SAMA Wellness 🌿
                  </h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 20px 40px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; padding: 30px;">
                    <tr>
                      <td style="color: #1E1E1E; font-size: 16px; line-height: 1.6;">
                        <p style="margin: 0 0 20px;">Hi <strong>${userName}</strong>,</p>
                        
                        <p style="margin: 0 0 20px;">
                          Thank you for joining SAMA! We're excited to have you start your wellness journey with us.
                        </p>
                        
                        <p style="margin: 0 0 30px;">
                          Please verify your email address to get started:
                        </p>
                        
                        <!-- Button -->
                        <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                          <tr>
                            <td align="center" style="background: linear-gradient(135deg, #7d9b7f 0%, #A7CDA9 100%); border-radius: 50px; padding: 14px 36px;">
                              <a href="${verificationLink}" style="color: white; text-decoration: none; font-size: 16px; font-weight: 600; display: block;">
                                Verify Email Address
                              </a>
                            </td>
                          </tr>
                        </table>
                        
                        <p style="margin: 30px 0 20px; font-size: 14px; color: #808080;">
                          Or copy and paste this link in your browser:
                        </p>
                        <p style="margin: 0 0 20px; word-break: break-all; font-size: 13px; color: #606060;">
                          ${verificationLink}
                        </p>
                        
                        <p style="margin: 20px 0 0; font-size: 14px; color: #808080;">
                          This link will expire in 24 hours.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 40px 40px; text-align: center; color: #1E1E1E; font-size: 14px;">
                  <p style="margin: 0 0 10px;">
                    If you didn't create an account with SAMA, you can safely ignore this email.
                  </p>
                  <p style="margin: 0; color: #606060;">
                    © 2026 SAMA Wellness. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  userName: string,
  verificationToken: string
): Promise<void> {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationLink = `${frontendUrl}/verify-email/${verificationToken}`;

  const html = generateVerificationEmail(userName, verificationLink);

  await sendEmail({
    to: email,
    subject: '✨ Verify Your Email - SAMA Wellness',
    html,
  });
}
