/**
 * Test Helpers and Utilities
 * Shared utilities for backend testing
 */

import { Request, Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";

/**
 * Create a mock Express Request object
 */
export const mockRequest = (overrides: Partial<Request> = {}): Partial<Request> => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    ...overrides,
  };
};

/**
 * Create a mock Express Response object with spies
 */
export const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
  };
  return res;
};

/**
 * Create a mock authenticated request
 */
export const mockAuthRequest = (
  userId: string,
  overrides: Partial<AuthRequest> = {}
): Partial<AuthRequest> => {
  return {
    ...mockRequest(overrides),
    user: { userId },
    ...overrides,
  };
};

/**
 * Wait for async operations to complete
 */
export const waitFor = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Mock database query result
 */
export const mockQueryResult = <T>(rows: T[]) => ({
  rows,
  rowCount: rows.length,
  command: "SELECT",
  oid: 0,
  fields: [],
});

/**
 * Sample test user data
 */
export const testUser = {
  id: "test-user-123",
  email: "test@example.com",
  full_name: "Test User",
  gender: "other",
  created_at: new Date().toISOString(),
};

/**
 * Sample dosha assessment result
 */
export const testDoshaResult = {
  primary_dosha: "Vata",
  secondary_dosha: "Pitta",
  prakriti_scores: {
    vata: 0.5,
    pitta: 0.3,
    kapha: 0.2,
  },
  confidence_score: 0.75,
};

/**
 * Sample quiz answers (properly typed)
 */
export const testQuizAnswers: Array<{
  question_id: string;
  selected_dosha: "Vata" | "Pitta" | "Kapha";
  weight: number;
  tier: "physical" | "physiological" | "behavioral";
}> = [
  {
    question_id: "1",
    selected_dosha: "Vata",
    weight: 1.0,
    tier: "physical",
  },
  {
    question_id: "2",
    selected_dosha: "Pitta",
    weight: 1.0,
    tier: "physical",
  },
  {
    question_id: "3",
    selected_dosha: "Kapha",
    weight: 1.0,
    tier: "physiological",
  },
];
