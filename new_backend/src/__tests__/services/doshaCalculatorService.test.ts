/**
 * Dosha Calculator Service Integration Tests
 */

import axios from 'axios';
import {
  calculateDoshaViaPython,
  checkDoshaServiceHealth,
} from '../../services/doshaCalculatorService';
import { testQuizAnswers } from '../../tests/testHelpers';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DoshaCalculatorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkDoshaServiceHealth', () => {
    it('should return true when service is healthy', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { status: 'ok' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const isHealthy = await checkDoshaServiceHealth();

      expect(isHealthy).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.objectContaining({
          timeout: expect.any(Number),
        })
      );
    });

    it('should return false when service is down', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Connection refused'));

      const isHealthy = await checkDoshaServiceHealth();

      expect(isHealthy).toBe(false);
    });

    it('should return false on timeout', async () => {
      mockedAxios.get.mockRejectedValueOnce({ code: 'ECONNABORTED' });

      const isHealthy = await checkDoshaServiceHealth();

      expect(isHealthy).toBe(false);
    });
  });

  describe('calculateDoshaViaPython', () => {
    it('should calculate dosha successfully', async () => {
      const mockResponse = {
        data: {
          primary_dosha: 'Vata',
          secondary_dosha: 'Pitta',
          scores: {
            vata: 0.5,
            pitta: 0.3,
            kapha: 0.2,
          },
          confidence_score: 0.75,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await calculateDoshaViaPython(testQuizAnswers);

      expect(result).toEqual(mockResponse.data);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/calculate'),
        { answers: testQuizAnswers },
        expect.objectContaining({
          timeout: expect.any(Number),
        })
      );
    });

    it('should throw error when service returns error', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { detail: 'Invalid answers' },
        },
      });

      await expect(calculateDoshaViaPython(testQuizAnswers)).rejects.toThrow();
    });

    it('should throw error on timeout', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        code: 'ECONNABORTED',
        message: 'Timeout',
      });

      await expect(calculateDoshaViaPython(testQuizAnswers)).rejects.toThrow('Dosha service timeout');
    });

    it('should throw error on connection failure', async () => {
      mockedAxios.post.mockRejectedValueOnce({
        code: 'ECONNREFUSED',
        message: 'Connection refused',
      });

      await expect(calculateDoshaViaPython(testQuizAnswers)).rejects.toThrow(
        'Dosha service unavailable'
      );
    });

    it('should validate response format', async () => {
      const invalidResponse = {
        data: {
          // Missing required fields
          primary_dosha: 'Vata',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockedAxios.post.mockResolvedValueOnce(invalidResponse);

      await expect(calculateDoshaViaPython(testQuizAnswers)).rejects.toThrow(
        'Invalid response'
      );
    });
  });
});
