import { Router, Request, Response } from 'express';
import { dbHealthCheck } from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import axios from 'axios';

const router = Router();

interface ServiceCheck {
  [key: string]: 'available' | 'unavailable';
}

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  service: string;
  version: string;
  checks: {
    database: 'connected' | 'disconnected';
    dependencies?: ServiceCheck;
  };
}

/**
 * Check if a downstream service is available
 */
async function checkServiceHealth(serviceUrl: string, timeout: number = 5000): Promise<boolean> {
  try {
    const response = await axios.get(`${serviceUrl}/health`, {
      timeout,
      validateStatus: (status) => status === 200,
    });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    // Check database connectivity
    const dbStatus = await dbHealthCheck();

    // Check downstream service availability
    const checkinChatUrl = process.env.CHECKIN_CHAT_URL;
    const checkinVoiceUrl = process.env.CHECKIN_VOICE_URL;

    const dependencies: ServiceCheck = {};

    // Only check services if URLs are configured
    if (checkinChatUrl) {
      const checkinChatAvailable = await checkServiceHealth(checkinChatUrl);
      dependencies['checkin-chat'] = checkinChatAvailable ? 'available' : 'unavailable';
    }

    if (checkinVoiceUrl) {
      const checkinVoiceAvailable = await checkServiceHealth(checkinVoiceUrl);
      dependencies['checkin-voice'] = checkinVoiceAvailable ? 'available' : 'unavailable';
    }

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (!dbStatus) {
      status = 'unhealthy';
    } else if (Object.values(dependencies).some((s) => s === 'unavailable')) {
      status = 'degraded';
    } else {
      status = 'healthy';
    }

    const health: HealthCheckResponse = {
      status,
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
      version: '1.0.0',
      checks: {
        database: dbStatus ? 'connected' : 'disconnected',
        ...(Object.keys(dependencies).length > 0 && { dependencies }),
      },
    };

    const statusCode = status === 'unhealthy' ? 503 : 200;
    return res.status(statusCode).json(health);
  })
);

export default router;
