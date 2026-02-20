import axios, { AxiosError } from "axios";

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export class NetworkError extends Error {
  constructor(message: string = "Network connection failed") {
    super(message);
    this.name = "NetworkError";
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = "Authentication failed") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class ValidationError extends Error {
  constructor(
    message: string = "Validation failed",
    public errors?: Record<string, string>,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class ServerError extends Error {
  constructor(
    message: string = "Server error occurred",
    public status?: number,
  ) {
    super(message);
    this.name = "ServerError";
  }
}

/**
 * Parse error from various sources into a consistent format
 */
export function parseError(error: unknown): AppError {
  // Axios error
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<any>;

    // Network error (no response)
    if (!axiosError.response) {
      return {
        message:
          "Unable to connect to server. Please check your internet connection.",
        code: "NETWORK_ERROR",
        status: 0,
      };
    }

    const status = axiosError.response.status;
    const data = axiosError.response.data;

    // Handle different status codes
    switch (status) {
      case 400:
        return {
          message: data?.message || "Invalid request. Please check your input.",
          code: "BAD_REQUEST",
          status: 400,
          details: data?.errors || data?.details,
        };

      case 401:
        return {
          message: data?.message || "Please log in to continue.",
          code: "UNAUTHORIZED",
          status: 401,
        };

      case 403:
        return {
          message:
            data?.message ||
            "You do not have permission to perform this action.",
          code: "FORBIDDEN",
          status: 403,
        };

      case 404:
        return {
          message: data?.message || "The requested resource was not found.",
          code: "NOT_FOUND",
          status: 404,
        };

      case 422:
        return {
          message:
            data?.message || "Validation failed. Please check your input.",
          code: "VALIDATION_ERROR",
          status: 422,
          details: data?.errors || data?.details,
        };

      case 429:
        return {
          message: "Too many requests. Please try again later.",
          code: "RATE_LIMIT",
          status: 429,
        };

      case 500:
        return {
          message: "Server error. Our team has been notified.",
          code: "SERVER_ERROR",
          status: 500,
        };

      case 502:
      case 503:
      case 504:
        return {
          message:
            "Service temporarily unavailable. Please try again in a moment.",
          code: "SERVICE_UNAVAILABLE",
          status,
        };

      default:
        return {
          message: data?.message || "An unexpected error occurred.",
          code: "UNKNOWN_ERROR",
          status,
        };
    }
  }

  // Custom error types
  if (error instanceof NetworkError) {
    return {
      message: error.message,
      code: "NETWORK_ERROR",
      status: 0,
    };
  }

  if (error instanceof AuthenticationError) {
    return {
      message: error.message,
      code: "AUTH_ERROR",
      status: 401,
    };
  }

  if (error instanceof ValidationError) {
    return {
      message: error.message,
      code: "VALIDATION_ERROR",
      status: 422,
      details: error.errors,
    };
  }

  if (error instanceof ServerError) {
    return {
      message: error.message,
      code: "SERVER_ERROR",
      status: error.status || 500,
    };
  }

  // Standard Error
  if (error instanceof Error) {
    return {
      message: error.message || "An unexpected error occurred.",
      code: "UNKNOWN_ERROR",
    };
  }

  // Unknown error type
  return {
    message: "An unexpected error occurred.",
    code: "UNKNOWN_ERROR",
  };
}

/**
 * Handle error and return user-friendly message
 */
export function handleError(error: unknown): string {
  const parsedError = parseError(error);

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", parsedError);
  }

  // Log to error reporting service in production
  if (process.env.NODE_ENV === "production") {
    // logToErrorService(parsedError);
  }

  return parsedError.message;
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return !error.response;
  }
  return error instanceof NetworkError;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  const parsedError = parseError(error);
  return parsedError.status === 401 || parsedError.code === "AUTH_ERROR";
}

/**
 * Check if error is a server error (5xx)
 */
export function isServerError(error: unknown): boolean {
  const parsedError = parseError(error);
  return (parsedError.status || 0) >= 500;
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) or auth errors
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        if (status >= 400 && status < 500) {
          throw error;
        }
      }

      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
