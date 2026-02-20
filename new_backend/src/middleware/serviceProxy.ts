import { Request, Response, NextFunction } from "express";
import axios, { AxiosError } from "axios";
import { logProxyRequest, logError } from "./requestLogger";

export interface ProxyConfig {
  target: string;
  pathRewrite?: Record<string, string>;
  timeout?: number;
  onError?: (error: Error) => void;
}

interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailureTime: Date | null;
  successCount: number;
}

const circuitBreakers = new Map<string, CircuitBreakerState>();

const FAILURE_THRESHOLD = 5;
const RESET_TIMEOUT = 30000; // 30 seconds
const HALF_OPEN_SUCCESS_THRESHOLD = 1;

function getCircuitBreaker(target: string): CircuitBreakerState {
  if (!circuitBreakers.has(target)) {
    circuitBreakers.set(target, {
      state: 'closed',
      failureCount: 0,
      lastFailureTime: null,
      successCount: 0,
    });
  }
  return circuitBreakers.get(target)!;
}

function recordSuccess(target: string): void {
  const breaker = getCircuitBreaker(target);
  
  if (breaker.state === 'half-open') {
    breaker.successCount++;
    if (breaker.successCount >= HALF_OPEN_SUCCESS_THRESHOLD) {
      breaker.state = 'closed';
      breaker.failureCount = 0;
      breaker.successCount = 0;
      breaker.lastFailureTime = null;
    }
  } else if (breaker.state === 'closed') {
    breaker.failureCount = 0;
    breaker.lastFailureTime = null;
  }
}

function recordFailure(target: string): void {
  const breaker = getCircuitBreaker(target);
  breaker.failureCount++;
  breaker.lastFailureTime = new Date();
  
  if (breaker.state === 'half-open') {
    breaker.state = 'open';
    breaker.successCount = 0;
  } else if (breaker.failureCount >= FAILURE_THRESHOLD) {
    breaker.state = 'open';
  }
}

function shouldAttemptRequest(target: string): boolean {
  const breaker = getCircuitBreaker(target);
  
  if (breaker.state === 'closed') {
    return true;
  }
  
  if (breaker.state === 'open' && breaker.lastFailureTime) {
    const timeSinceLastFailure = Date.now() - breaker.lastFailureTime.getTime();
    if (timeSinceLastFailure >= RESET_TIMEOUT) {
      breaker.state = 'half-open';
      breaker.successCount = 0;
      return true;
    }
    return false;
  }
  
  if (breaker.state === 'half-open') {
    return true;
  }
  
  return false;
}

export function createProxyMiddleware(config: ProxyConfig) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const startTime = Date.now();
    const requestId = req.requestId || "unknown";
    
    try {
      // Check circuit breaker
      if (!shouldAttemptRequest(config.target)) {
        const duration = Date.now() - startTime;
        logProxyRequest(
          requestId,
          req.method,
          req.path,
          config.target,
          config.target,
          duration,
          503
        );
        
        res.status(503).json({
          error: "Service Unavailable",
          message: "The requested service is temporarily unavailable",
          service: config.target,
        });
        return;
      }

      // Apply path rewriting
      let targetPath = req.path;
      if (config.pathRewrite) {
        for (const [pattern, replacement] of Object.entries(config.pathRewrite)) {
          const regex = new RegExp(pattern);
          targetPath = targetPath.replace(regex, replacement);
        }
      }

      // Build target URL
      const targetUrl = `${config.target}${targetPath}`;
      const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
      const fullUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;

      // Prepare headers
      const headers: Record<string, string> = {};
      
      // Preserve important headers
      if (req.headers.authorization) {
        headers['Authorization'] = req.headers.authorization as string;
      }
      if (req.headers.cookie) {
        headers['Cookie'] = req.headers.cookie as string;
      }
      if (req.headers['content-type']) {
        headers['Content-Type'] = req.headers['content-type'] as string;
      }
      
      // Add forwarding headers
      headers['X-Forwarded-For'] = req.ip || req.socket.remoteAddress || '';
      headers['X-Forwarded-Host'] = req.hostname;
      headers['X-Forwarded-Proto'] = req.protocol;
      
      // Copy user context headers if present
      if (req.headers['x-user-id']) {
        headers['X-User-Id'] = req.headers['x-user-id'] as string;
      }
      if (req.headers['x-user-email']) {
        headers['X-User-Email'] = req.headers['x-user-email'] as string;
      }
      if (req.headers['x-user-roles']) {
        headers['X-User-Roles'] = req.headers['x-user-roles'] as string;
      }

      // Make the proxy request
      const response = await axios({
        method: req.method,
        url: fullUrl,
        headers,
        data: req.body,
        timeout: config.timeout || 30000,
        validateStatus: () => true, // Don't throw on any status code
      });

      // Record success
      recordSuccess(config.target);
      
      // Log proxy request
      const duration = Date.now() - startTime;
      logProxyRequest(
        requestId,
        req.method,
        req.path,
        config.target,
        fullUrl,
        duration,
        response.status
      );

      // Forward response
      res.status(response.status);
      
      // Copy response headers
      Object.entries(response.headers).forEach(([key, value]) => {
        if (value !== undefined) {
          res.setHeader(key, value as string);
        }
      });
      
      res.send(response.data);
    } catch (error) {
      // Record failure
      recordFailure(config.target);
      
      const duration = Date.now() - startTime;
      
      // Log error with context
      logError(error as Error, {
        request_id: requestId,
        method: req.method,
        path: req.path,
        target_service: config.target,
        duration_ms: duration,
      });
      
      if (config.onError) {
        config.onError(error as Error);
      }

      // Handle different error types
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        
        if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'ENOTFOUND') {
          res.status(503).json({
            error: "Service Unavailable",
            message: "The requested service is temporarily unavailable",
            service: config.target,
          });
          return;
        }
        
        if (axiosError.code === 'ETIMEDOUT' || axiosError.code === 'ECONNABORTED') {
          res.status(504).json({
            error: "Gateway Timeout",
            message: "The service took too long to respond",
            service: config.target,
          });
          return;
        }
        
        if (axiosError.response) {
          res.status(502).json({
            error: "Bad Gateway",
            message: "The service returned an invalid response",
            service: config.target,
          });
          return;
        }
      }

      // Generic error
      res.status(502).json({
        error: "Bad Gateway",
        message: "An error occurred while proxying the request",
        service: config.target,
      });
    }
  };
}
