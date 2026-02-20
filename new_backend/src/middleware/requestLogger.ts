import { Request, Response, NextFunction } from "express";

/**
 * Log levels supported by the request logger
 */
export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

/**
 * Log level priority for filtering
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
};

/**
 * Get configured log level from environment variable
 * Defaults to INFO if not set or invalid
 */
function getConfiguredLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();
  
  switch (envLevel) {
    case "debug":
      return LogLevel.DEBUG;
    case "info":
      return LogLevel.INFO;
    case "warn":
      return LogLevel.WARN;
    case "error":
      return LogLevel.ERROR;
    default:
      return LogLevel.INFO;
  }
}

/**
 * Check if a log level should be output based on configured level
 */
function shouldLog(level: LogLevel): boolean {
  const configuredLevel = getConfiguredLogLevel();
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[configuredLevel];
}

/**
 * Format timestamp in ISO 8601 format
 */
function formatTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Log a message with the specified level
 */
function log(level: LogLevel, message: string, context?: Record<string, any>) {
  if (!shouldLog(level)) {
    return;
  }

  const timestamp = formatTimestamp();
  const contextStr = context ? ` | ${JSON.stringify(context)}` : "";
  
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] [api-gateway] ${message}${contextStr}`;

  switch (level) {
    case LogLevel.ERROR:
      console.error(logMessage);
      break;
    case LogLevel.WARN:
      console.warn(logMessage);
      break;
    case LogLevel.INFO:
      console.info(logMessage);
      break;
    case LogLevel.DEBUG:
      console.debug(logMessage);
      break;
  }
}

/**
 * Request logging middleware
 * Logs all incoming requests with timestamp, method, path, status code
 * Logs proxy requests with target service and response time
 * Logs errors with stack trace and context
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  const requestId = (req as any).requestId || "unknown";

  // Log incoming request
  log(LogLevel.INFO, "Incoming request", {
    request_id: requestId,
    method: req.method,
    path: req.path,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    user_agent: req.get("user-agent"),
  });

  // Capture the original end function
  const originalEnd = res.end;

  // Override res.end to log response
  res.end = function (chunk?: any, encoding?: any, callback?: any): any {
    const duration = Date.now() - startTime;

    // Log completed request
    log(LogLevel.INFO, "Request completed", {
      request_id: requestId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration_ms: duration,
    });

    // Call the original end function
    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
};

/**
 * Log proxy request with target service and response time
 */
export function logProxyRequest(
  requestId: string,
  method: string,
  path: string,
  targetService: string,
  targetUrl: string,
  duration: number,
  statusCode?: number
) {
  log(LogLevel.INFO, "Proxy request", {
    request_id: requestId,
    method,
    path,
    target_service: targetService,
    target_url: targetUrl,
    duration_ms: duration,
    status: statusCode,
  });
}

/**
 * Log error with stack trace and context
 */
export function logError(
  error: Error,
  context?: {
    request_id?: string;
    method?: string;
    path?: string;
    user_id?: string;
    [key: string]: any;
  }
) {
  log(LogLevel.ERROR, error.message, {
    ...context,
    stack: error.stack,
    error_name: error.name,
  });
}

/**
 * Log warning message
 */
export function logWarning(message: string, context?: Record<string, any>) {
  log(LogLevel.WARN, message, context);
}

/**
 * Log info message
 */
export function logInfo(message: string, context?: Record<string, any>) {
  log(LogLevel.INFO, message, context);
}

/**
 * Log debug message
 */
export function logDebug(message: string, context?: Record<string, any>) {
  log(LogLevel.DEBUG, message, context);
}
