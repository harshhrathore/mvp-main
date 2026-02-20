import { Request, Response } from "express";
import { hashPassword, comparePassword } from "../utils/hashPassword";
import { generateToken } from "../utils/jwt";
import {
  createUser,
  createAuthRecord,
  findUserByEmail,
  findAuthByUserId,
  isAccountLocked,
  recordLoginSuccess,
  recordLoginFailure,
} from "../services/userService";
import {
  generateVerificationToken,
  storeVerificationToken,
  verifyEmailToken,
  getVerificationToken,
} from "../services/verificationService";
import { sendVerificationEmail } from "../services/emailService";

export const register = async (req: Request, res: Response) => {
  const { full_name, email, password, gender } = req.body;

  try {
    // Check duplicate
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const hashed = await hashPassword(password);
    const user = await createUser(full_name, email, gender || null);
    await createAuthRecord(user.id, hashed);

    // Generate and store verification token
    const verificationToken = generateVerificationToken();
    await storeVerificationToken(user.id, verificationToken);

    // Send verification email
    try {
      await sendVerificationEmail(email, full_name, verificationToken);
      console.log(`📧 Verification email sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue registration even if email fails
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful! Please check your email to verify your account.",
      data: {
        email: user.email,
        full_name: user.full_name,
      },
    });
  } catch (err) {
    console.error("[auth] register —", err);
    return res.status(500).json({ success: false, message: "Registration failed. Please try again." });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const auth = await findAuthByUserId(user.id);
    if (!auth || !auth.password_hash ) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Account lock check
    const locked = await isAccountLocked(user.id);
    if (locked) {
      return res.status(429).json({ success: false, message: "Account locked. Try again in 15 minutes." });
    }

    const match = await comparePassword(password, auth.password_hash);
    if (!match) {
      await recordLoginFailure(user.id);
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    await recordLoginSuccess(user.id);
    const token = generateToken(user.id);

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: { id: user.id, email: user.email, full_name: user.full_name },
      },
    });
  } catch (err) {
    console.error("[auth] login —", err);
    return res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
};

// returns current user info 
export const getMe = async (req: Request, res: Response) => {
  
  const { userId } = (req as any).user;

  try {
    const { findUserById } = await import("../services/userService");
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({
      success: true,
      data: { id: user.id, email: user.email, full_name: user.full_name, gender: user.gender },
    });
  } catch (err) {
    console.error("[auth] getMe —", err);
    return res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
};

/**
 * Verify email with token
 * GET /api/auth/verify-email/:token
 */
export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.params;

  console.log(`[auth] Verifying email with token: ${token.substring(0, 10)}...`);

  try {
    const result = await verifyEmailToken(token);

    if (!result) {
      console.log(`[auth] Verification failed - Invalid or expired token`);
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    // Generate JWT token for the user
    const jwtToken = generateToken(result.userId);

    console.log(`✅ Email verified successfully for: ${result.email}`);
    return res.json({
      success: true,
      message: "Email verified successfully! Welcome to SAMA Wellness 🌿",
      data: {
        token: jwtToken,
        user: {
          id: result.userId,
          email: result.email,
          full_name: result.full_name,
        },
      },
    });
  } catch (err) {
    console.error("[auth] verifyEmail error —", err);
    return res.status(500).json({
      success: false,
      message: "Email verification failed. Please try again.",
    });
  }
};

/**
 * Resend verification email
 * POST /api/auth/resend-verification
 */
export const resendVerification = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    // Check if email is already verified
    const existingToken = await getVerificationToken(email);
    if (existingToken === null) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new token
    const verificationToken = generateVerificationToken();
    await storeVerificationToken(user.id, verificationToken);

    // Send verification email
    try {
      await sendVerificationEmail(email, user.full_name, verificationToken);
      console.log(`📧 Verification email resent to ${email}`);
    } catch (emailError) {
      console.error('Failed to resend verification email:', emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again later.",
      });
    }

    return res.json({
      success: true,
      message: "Verification email sent! Please check your inbox.",
    });
  } catch (err) {
    console.error("[auth] resendVerification —", err);
    return res.status(500).json({
      success: false,
      message: "Failed to resend verification email. Please try again.",
    });
  }
};