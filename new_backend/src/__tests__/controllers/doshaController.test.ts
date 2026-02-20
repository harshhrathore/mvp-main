/**
 * Dosha Controller Tests
 * TDD approach for dosha quiz endpoints
 */

import { Request, Response } from 'express';
import { getQuestions, submitQuiz, getProfile } from '../../controllers/doshaController';
import { mockAuthRequest, mockResponse, testDoshaResult } from '../../tests/testHelpers';
import * as doshaService from '../../services/doshaService';
import * as onboardingService from '../../services/onboardingService';

// Mock the services
jest.mock('../../services/doshaService');
jest.mock('../../services/onboardingService');

describe('DoshaController - getQuestions', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = mockAuthRequest('test-user-123');
    res = mockResponse();
    jest.clearAllMocks();
  });

  it('should return 15 dosha questions in correct format', async () => {
    await getQuestions(req as Request, res as Response);

    expect(res.status).not.toHaveBeenCalled(); // Should default to 200
    expect(res.json).toHaveBeenCalled();

    const response = (res.json as jest.Mock).mock.calls[0][0];
    expect(response.success).toBe(true);
    expect(response.data.questions).toHaveLength(15);
    expect(response.data.version).toBeDefined();
  });

  it('should return questions with required fields', async () => {
    await getQuestions(req as Request, res as Response);

    const response = (res.json as jest.Mock).mock.calls[0][0];
    const firstQuestion = response.data.questions[0];

    expect(firstQuestion).toHaveProperty('question_id');
    expect(firstQuestion).toHaveProperty('question_text');
    expect(firstQuestion).toHaveProperty('tier');
    expect(firstQuestion).toHaveProperty('options');
    expect(Array.isArray(firstQuestion.options)).toBe(true);
    expect(firstQuestion.options.length).toBeGreaterThanOrEqual(3);
  });

  it('should return options with dosha mappings and weights', async () => {
    await getQuestions(req as Request, res as Response);

    const response = (res.json as jest.Mock).mock.calls[0][0];
    const firstOption = response.data.questions[0].options[0];

    expect(firstOption).toHaveProperty('option_text');
    expect(firstOption).toHaveProperty('dosha');
    expect(firstOption).toHaveProperty('weight');
    expect(['vata', 'pitta', 'kapha']).toContain(firstOption.dosha.toLowerCase());
    expect(typeof firstOption.weight).toBe('number');
  });

  it('should have balanced tier distribution', async () => {
    await getQuestions(req as Request, res as Response);

    const response = (res.json as jest.Mock).mock.calls[0][0];
    const questions = response.data.questions;

    const physicalQuestions = questions.filter((q: any) => q.tier === 'physical');
    const physiologicalQuestions = questions.filter((q: any) => q.tier === 'physiological');
    const behavioralQuestions = questions.filter((q: any) => q.tier === 'behavioral');

    // At least some questions in each tier
    expect(physicalQuestions.length).toBeGreaterThan(0);
    expect(physiologicalQuestions.length).toBeGreaterThan(0);
    expect(behavioralQuestions.length).toBeGreaterThan(0);

    // Physical should have more questions (as it has 50% weight)
    expect(physicalQuestions.length).toBeGreaterThanOrEqual(physiologicalQuestions.length);
  });
});

describe('DoshaController - submitQuiz', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = mockAuthRequest('test-user-123');
    res = mockResponse();
    jest.clearAllMocks();
  });

  it('should calculate dosha and return results', async () => {
    const mockAnswers = [
      { question_id: 1, selected_option: 0, selected_dosha: 'vata', weight: 1.0, tier: 'physical' },
      { question_id: 2, selected_option: 1, selected_dosha: 'pitta', weight: 1.0, tier: 'physical' },
    ];

    req.body = { answers: mockAnswers };

    (doshaService.calculateDosha as jest.Mock).mockReturnValue(testDoshaResult);
    (doshaService.saveAssessment as jest.Mock).mockResolvedValue({});
    (onboardingService.markStep3Done as jest.Mock).mockResolvedValue(undefined);

    await submitQuiz(req as any, res as Response);

    expect(doshaService.calculateDosha).toHaveBeenCalledWith(mockAnswers);
    expect(doshaService.saveAssessment).toHaveBeenCalled();
    expect(onboardingService.markStep3Done).toHaveBeenCalledWith('test-user-123');
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Dosha assessment complete',
      data: {
        primary_dosha: testDoshaResult.primary_dosha,
        secondary_dosha: testDoshaResult.secondary_dosha,
        scores: testDoshaResult.prakriti_scores,
        confidence: testDoshaResult.confidence_score,
      },
    });
  });

  it('should return 400 if answers are not provided', async () => {
    req.body = {};

    await submitQuiz(req as any, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'answers array is required',
    });
  });

  it('should return 400 if answers array is empty', async () => {
    req.body = { answers: [] };

    await submitQuiz(req as any, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
