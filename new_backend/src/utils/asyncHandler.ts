import { Request, Response, NextFunction } from 'express';

/**
 * Wraps async route handlers to catch errors and pass them to error middleware
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Creates a standardized error response
 */
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Common error responses
 */
export const ErrorResponses = {
  NotFound: (resource: string = 'Resource') => new AppError(`${resource} not found`, 404),

  Unauthorized: (message: string = 'Unauthorized access') => new AppError(message, 401),

  Forbidden: (message: string = 'Access forbidden') => new AppError(message, 403),

  BadRequest: (message: string = 'Invalid request') => new AppError(message, 400),

  Conflict: (message: string = 'Resource conflict') => new AppError(message, 409),

  ServiceUnavailable: (message: string = 'Service temporarily unavailable') =>
    new AppError(message, 503),

  InternalError: (message: string = 'Internal server error') => new AppError(message, 500),
};
