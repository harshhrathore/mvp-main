import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { findUserById } from "../services/userService";

export interface UserContext {
  userId: string;
  email: string;
  roles?: string[];
}

/**
 * Extract and validate user context from JWT token
 */
export async function extractUserContext(req: Request): Promise<UserContext | null> {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }

  const token = header.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return null;
  }

  // Fetch user details from database
  try {
    const user = await findUserById(decoded.userId);
    
    if (!user) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email,
      roles: [], // Can be extended to include actual roles from database
    };
  } catch (error) {
    console.error("Error fetching user context:", error);
    return null;
  }
}

/**
 * Middleware to inject user context headers for downstream services
 * This middleware is optional - it adds headers if authentication is present
 * but doesn't block the request if authentication is missing
 */
export function injectUserContext(req: Request, res: Response, next: NextFunction): void {
  extractUserContext(req)
    .then((context) => {
      if (context) {
        req.headers['x-user-id'] = context.userId;
        req.headers['x-user-email'] = context.email;
        if (context.roles && context.roles.length > 0) {
          req.headers['x-user-roles'] = context.roles.join(',');
        }
      }
      next();
    })
    .catch((error) => {
      console.error("Error in injectUserContext middleware:", error);
      next(); // Continue even if there's an error
    });
}

/**
 * Middleware to require authentication and inject user context
 * This middleware blocks the request if authentication is missing or invalid
 */
export function requireAuthContext(req: Request, res: Response, next: NextFunction): void {
  extractUserContext(req)
    .then((context) => {
      if (!context) {
        res.status(401).json({
          success: false,
          message: "Invalid or expired token",
        });
        return;
      }
      
      req.headers['x-user-id'] = context.userId;
      req.headers['x-user-email'] = context.email;
      if (context.roles && context.roles.length > 0) {
        req.headers['x-user-roles'] = context.roles.join(',');
      }
      
      next();
    })
    .catch((error) => {
      console.error("Error in requireAuthContext middleware:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    });
}
