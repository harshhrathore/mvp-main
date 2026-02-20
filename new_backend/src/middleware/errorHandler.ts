import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/db';
import { logError } from './requestLogger';

interface AppError extends Error {
  status?: number;
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

// Database error codes
const DB_ERROR_CODES: Record<string, { status: number; message: string }> = {
  '23505': { status: 409, message: 'Resource already exists' },
  '23503': { status: 400, message: 'Referenced resource not found' },
  '23502': { status: 400, message: 'Required field is missing' },
  '22P02': { status: 400, message: 'Invalid input format' },
  '42P01': { status: 500, message: 'Database table not found' },
};

export const errorHandler = (
  err: AppError | any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Determine status code
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorType = 'server';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = err.message || 'Validation failed';
    errorType = 'validation';
  } else if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
    status = 401;
    message = 'Authentication failed';
    errorType = 'auth';
  } else if (err.name === 'TokenExpiredError') {
    status = 401;
    message = 'Token expired';
    errorType = 'auth';
  } else if (err.code && DB_ERROR_CODES[err.code]) {
    const dbError = DB_ERROR_CODES[err.code];
    status = dbError.status;
    message = dbError.message;
    errorType = 'database';
  } else if (err.code === 'ECONNREFUSED') {
    status = 503;
    message = 'Service temporarily unavailable';
    errorType = 'service';
  } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
    status = 504;
    message = 'Request timeout';
    errorType = 'timeout';
  } else if (status >= 400 && status < 500) {
    errorType = 'client';
  }

  // Don't expose internal errors in production
  if (status === 500 && process.env.NODE_ENV === 'production') {
    message = 'An unexpected error occurred. Please try again later.';
  }

  // Log error with context
  logError(err, {
    request_id: (req as any).requestId || 'unknown',
    method: req.method,
    path: req.path,
    status,
    error_type: errorType,
    user_id: (req as any).user?.id || 'anonymous',
  });

  // Persist to error_logs (fire-and-forget)
  pool
    .query(
      `INSERT INTO error_logs (error_type, error_message, stack_trace, endpoint, resolved)
       VALUES ($1, $2, $3, $4, FALSE)`,
      [errorType, err.message || message, err.stack || '', `${req.method} ${req.path}`]
    )
    .catch(() => {
      // Silently fail if DB is down
    });

  // Send response
  res.status(status).json({
    success: false,
    error: {
      message,
      type: errorType,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err,
      }),
    },
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Log but don't exit - let the app continue
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error);
  // Log but don't exit immediately - give time for cleanup
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});
