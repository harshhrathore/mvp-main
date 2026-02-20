/**
 * Dosha API Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the api module before importing
vi.mock("../../api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { api } from "../../api";
import {
  fetchDoshaQuestions,
  submitDoshaQuiz,
  fetchDoshaProfile,
} from "../dosha";

const mockedApi = api as any;

describe("Dosha API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchDoshaQuestions", () => {
    it("should fetch 15 dosha questions", async () => {
      const mockData = {
        questions: Array(15)
          .fill(null)
          .map((_, i) => ({
            question_id: i + 1,
            question_text: `Question ${i + 1}`,
            tier: "physical",
            options: [
              { option_text: "Option A", dosha: "vata", weight: 1.0 },
              { option_text: "Option B", dosha: "pitta", weight: 1.0 },
              { option_text: "Option C", dosha: "kapha", weight: 1.0 },
            ],
          })),
        version: "1.0.0",
      };

      mockedApi.get.mockResolvedValueOnce({ data: mockData });

      const result = await fetchDoshaQuestions();

      expect(result.questions).toHaveLength(15);
      expect(result.version).toBe("1.0.0");
      expect(mockedApi.get).toHaveBeenCalledWith("/api/dosha/questions");
    });

    it("should throw error on API failure", async () => {
      mockedApi.get.mockRejectedValueOnce(new Error("Network error"));

      await expect(fetchDoshaQuestions()).rejects.toThrow();
    });
  });

  describe("submitDoshaQuiz", () => {
    it("should submit quiz answers and return results", async () => {
      const answers = [
        {
          question_id: "1",
          selected_option: 0,
          selected_dosha: "Vata",
          weight: 1.0,
          tier: "physical",
        },
        {
          question_id: "2",
          selected_option: 1,
          selected_dosha: "Pitta",
          weight: 1.0,
          tier: "physical",
        },
      ];

      const mockData = {
        primary_dosha: "Vata",
        secondary_dosha: "Pitta",
        scores: {
          vata: 0.5,
          pitta: 0.3,
          kapha: 0.2,
        },
        confidence: 0.75,
      };

      mockedApi.post.mockResolvedValueOnce({ data: mockData });

      const result = await submitDoshaQuiz(answers);

      expect(result.primary_dosha).toBe("Vata");
      expect(result.scores).toHaveProperty("vata");
      expect(mockedApi.post).toHaveBeenCalledWith("/api/dosha/submit", {
        answers,
      });
    });

    it("should throw error with invalid answers", async () => {
      mockedApi.post.mockRejectedValueOnce(new Error("Invalid answers"));

      await expect(submitDoshaQuiz([])).rejects.toThrow();
    });
  });

  describe("fetchDoshaProfile", () => {
    it("should fetch user dosha profile", async () => {
      const mockData = {
        primary_dosha: "Vata",
        secondary_dosha: "Pitta",
        scores: {
          vata: 0.5,
          pitta: 0.3,
          kapha: 0.2,
        },
        confidence: 0.75,
        assessed_at: "2026-02-13T00:00:00Z",
      };

      mockedApi.get.mockResolvedValueOnce({ data: mockData });

      const result = await fetchDoshaProfile();

      expect(result.primary_dosha).toBe("Vata");
      expect(result.assessed_at).toBeDefined();
      expect(mockedApi.get).toHaveBeenCalledWith("/api/dosha/profile");
    });

    it("should handle 404 when no profile exists", async () => {
      mockedApi.get.mockRejectedValueOnce(new Error("Not found"));

      await expect(fetchDoshaProfile()).rejects.toThrow();
    });
  });
});
