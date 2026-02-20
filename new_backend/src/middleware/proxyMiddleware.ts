import { Request, Response, NextFunction } from "express";
import axios, { AxiosError } from "axios";
import { AuthRequest } from "./authMiddleware";

// Service URLs from environment
const CHECKIN_CHAT_URL = process.env.CHECKIN_CHAT_URL || "http://localhost:8000";
const CHECKIN_VOICE_URL = process.env.CHECKIN_VOICE_URL || "http://localhost:8001";

// Circuit breaker tracking
interface ServiceHealth {
  url: string;
  available: boolean;
  lastCheck: Date;
  failureCount: number;
}

const serviceHealth = new Map<string, ServiceHealth>();

// Initialize service health tracking
const initServiceHealth = (serviceName: string, url: string) => {
  if (!serviceHealth.has(serviceName)) {
    serviceHealth.set(serviceName, {
      url,
      available: true,
      lastCheck: new Date(),
      failureCount: 0,
    });
  }
};

// Check if service is available (simple circuit breaker)
const isServiceAvailable = (serviceName: string): boolean => {
  const health = serviceHealth.get(serviceName);
  if (!health) return true;

  // If failure count exceeds threshold, mark as unavailable for 30 seconds
  if (health.failureCount >= 3) {
    const timeSinceLastCheck = Date.now() - health.lastCheck.getTime();
    if (timeSinceLastCheck < 30000) {
      return false;
    }
    // Reset after 30 seconds
    health.failureCount = 0;
    health.available = true;
  }

  return health.available;
};

// Update service health status
const updateServiceHealth = (serviceName: string, success: boolean) => {
  const health = serviceHealth.get(serviceName);
  if (!health) return;

  health.lastCheck = new Date();
  if (success) {
    health.failureCount = 0;
    health.available = true;
  } else {
    health.failureCount++;
    if (health.failureCount >= 3) {
      health.available = false;
      console.error(`[PROXY] Service ${serviceName} marked as unavailable after ${health.failureCount} failures`);
    }
  }
};

/**
 * Proxy middleware factory
 * Creates middleware that forwards requests to specified microservice
 */
export const createProxyMiddleware = (serviceName: string, targetUrl: string) => {
  // Initialize service health tracking
  initServiceHealth(serviceName, targetUrl);

  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    // Check circuit breaker
    if (!isServiceAvailable(serviceName)) {
      console.error(`[PROXY] Service ${serviceName} is currently unavailable`);
      return res.status(503).json({
        success: false,
        message: `${serviceName} service is temporarily unavailable. Please try again later.`,
      });
    }

    try {
      // Extract the path after /api/checkin or /api/voice
      const originalPath = req.originalUrl;
      let targetPath = originalPath;

      // For checkin service: /api/checkin/* -> /api/daily_checkin/*
      if (serviceName === "checkin-chat") {
        if (originalPath.includes("/api/checkin")) {
          targetPath = originalPath.replace("/api/checkin", "/api/daily_checkin");
        } else if (originalPath.includes("/api/chat")) {
          targetPath = originalPath.replace("/api/chat", "/api/daily_checkin/chat");
        }
      }

      // For voice service: /api/voice/* -> /api/voice/*
      if (serviceName === "checkin-voice") {
        targetPath = originalPath.replace("/api/voice", "/api/voice");
      }

      const fullUrl = `${targetUrl}${targetPath}`;

      console.log(`[PROXY] Forwarding ${req.method} ${originalPath} -> ${fullUrl}`);

      // Prepare headers with user context
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add authentication context headers if user is authenticated
      if (req.user) {
        headers["X-User-Id"] = req.user.userId;
      }

      // Forward the request
      const response = await axios({
        method: req.method,
        url: fullUrl,
        data: req.body,
        headers,
        timeout: 30000, // 30 second timeout
        validateStatus: () => true, // Accept all status codes
      });

      // Update service health
      updateServiceHealth(serviceName, response.status < 500);

      // Forward the response
      res.status(response.status).json(response.data);
    } catch (error) {
      // Update service health on failure
      updateServiceHealth(serviceName, false);

      const axiosError = error as AxiosError;

      console.error(`[PROXY] Error forwarding to ${serviceName}:`, {
        service: serviceName,
        path: req.originalUrl,
        error: axiosError.message,
        code: axiosError.code,
      });

      // Handle different error scenarios
      if (axiosError.code === "ECONNREFUSED") {
        return res.status(503).json({
          success: false,
          message: `Unable to connect to ${serviceName} service. Please ensure it is running.`,
        });
      }

      if (axiosError.code === "ETIMEDOUT" || axiosError.code === "ECONNABORTED") {
        return res.status(504).json({
          success: false,
          message: `Request to ${serviceName} service timed out. Please try again.`,
        });
      }

      // Generic error
      return res.status(500).json({
        success: false,
        message: `An error occurred while processing your request.`,
      });
    }
  };
};

/**
 * Checkin service proxy middleware
 */
export const checkinProxy = createProxyMiddleware("checkin-chat", CHECKIN_CHAT_URL);

/**
 * Voice service proxy middleware
 */
export const voiceProxy = createProxyMiddleware("checkin-voice", CHECKIN_VOICE_URL);

/**
 * Health check for all services
 */
export const getServicesHealth = () => {
  const health: Record<string, any> = {};

  serviceHealth.forEach((value, key) => {
    health[key] = {
      available: value.available,
      lastCheck: value.lastCheck,
      failureCount: value.failureCount,
    };
  });

  return health;
};
