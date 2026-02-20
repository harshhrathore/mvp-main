import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

/**
 * Performance logging middleware
 * Measures request duration and logs when thresholds are exceeded
 * - Text chat endpoints: 3 seconds threshold
 * - Voice endpoints: 5 seconds threshold
 */
export const performanceLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Generate unique request ID
  const requestId = randomUUID();
  req.requestId = requestId;

  // Record start time
  const startTime = Date.now();

  // Capture the original end function
  const originalEnd = res.end;

  // Override res.end to measure duration
  res.end = function (chunk?: any, encoding?: any, callback?: any): any {
    // Calculate duration
    const duration = Date.now() - startTime;
    const durationSeconds = (duration / 1000).toFixed(3);

    // Determine threshold based on endpoint
    const endpoint = req.path;
    let threshold = 3000; // Default 3 seconds for text chat

    if (endpoint.includes("/voice")) {
      threshold = 5000; // 5 seconds for voice endpoints
    }

    // Log if threshold exceeded
    if (duration > threshold) {
      console.warn(
        `⚠️  Performance threshold exceeded | ` +
          `request_id: ${requestId} | ` +
          `endpoint: ${req.method} ${endpoint} | ` +
          `duration: ${durationSeconds}s | ` +
          `threshold: ${threshold / 1000}s | ` +
          `status: ${res.statusCode}`
      );
    }

    // Always log for monitoring (can be filtered by log level in production)
    console.log(
      `📊 Request completed | ` +
        `request_id: ${requestId} | ` +
        `endpoint: ${req.method} ${endpoint} | ` +
        `duration: ${durationSeconds}s | ` +
        `status: ${res.statusCode}`
    );

    // Call the original end function
    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
};

// Extend Express Request type to include requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}
