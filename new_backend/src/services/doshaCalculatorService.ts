/**
 * Dosha Calculator Service - Python FastAPI Integration
 * Calls the Python FastAPI microservice for dosha calculation
 * Falls back to TypeScript calculation if Python service is unavailable
 */

import axios from 'axios';
import { env } from '../config/env';
import { QuizAnswer } from '../types';

const DOSHA_SERVICE_URL = env.doshaServiceUrl();
const TIMEOUT = env.doshaServiceTimeout();

export interface PythonDoshaResult {
  primary_dosha: string;
  secondary_dosha: string;
  scores: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  confidence_score: number;
}

/**
 * Check if the Python dosha service is healthy
 */
export async function checkDoshaServiceHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${DOSHA_SERVICE_URL}/health`, {
      timeout: 2000, // 2 second timeout for health check
    });
    const data = response.data as { status?: string };
    return response.status === 200 && data.status === 'ok';
  } catch (error) {
    console.error('[doshaCalculatorService] Health check failed:', error);
    return false;
  }
}

/**
 * Calculate dosha using Python FastAPI service
 * @throws Error if service is unavailable or returns invalid response
 */
export async function calculateDoshaViaPython(
  answers: QuizAnswer[]
): Promise<PythonDoshaResult> {
  try {
    const response = await axios.post(
      `${DOSHA_SERVICE_URL}/calculate`,
      { answers },
      {
        timeout: TIMEOUT,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Validate response
    const result = response.data as any;
    if (
      !result.primary_dosha ||
      !result.secondary_dosha ||
      !result.scores ||
      typeof result.confidence_score !== 'number'
    ) {
      throw new Error('Invalid response format from dosha service');
    }

    return result as PythonDoshaResult;
  } catch (error: any) {
    // Handle axios errors
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const detail = error.response.data?.detail || 'Unknown error';
      throw new Error(`Dosha service error (${status}): ${detail}`);
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Dosha service timeout - calculation took too long');
    }
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error(
        'Dosha service unavailable - please ensure the Python service is running'
      );
    }
    
    // Re-throw if it's already our custom error
    if (error.message && error.message.includes('Invalid response')) {
      throw error;
    }
    
    throw new Error('Failed to calculate dosha via Python service');
  }
}
