import { Response, Request } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import {
  calculateDosha,
  saveAssessment,
  getLatestAssessment,
} from "../services/doshaService";
import { markStep3Done } from "../services/onboardingService";
import { QuizAnswer } from "../types";
import { getDoshaQuestions } from "../data/doshaQuestions";

// GET /api/dosha/questions
export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { questions, version } = getDoshaQuestions();
    
    return res.json({
      success: true,
      data: {
        questions,
        version,
      },
    });
  } catch (err) {
    console.error("[dosha] getQuestions —", err);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch dosha questions" 
    });
  }
};

// POST /api/dosha/submit
export const submitQuiz = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { answers } = req.body; // QuizAnswer[]

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ success: false, message: "answers array is required" });
  }

  try {
    const result = calculateDosha(answers as QuizAnswer[]);
    await saveAssessment(userId, answers, result);
    await markStep3Done(userId); 

    return res.json({
      success: true,
      message: "Dosha assessment complete",
      data: {
        primary_dosha: result.primary_dosha,
        secondary_dosha: result.secondary_dosha,
        scores: result.prakriti_scores,
        confidence: result.confidence_score,
      },
    });
  } catch (err) {
    console.error("[dosha] submitQuiz —", err);
    return res.status(500).json({ success: false, message: "Failed to process quiz" });
  }
};

// GET /api/dosha/profile
export const getProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  try {
    const assessment = await getLatestAssessment(userId);
    if (!assessment) {
      return res.status(404).json({ success: false, message: "No dosha assessment found. Please complete the quiz first." });
    }

    return res.json({
      success: true,
      data: {
        primary_dosha: assessment.primary_dosha,
        secondary_dosha: assessment.secondary_dosha,
        scores: assessment.prakriti_scores,
        confidence: assessment.confidence_score,
        assessed_at: assessment.completed_at,
      },
    });
  } catch (err) {
    console.error("[dosha] getProfile —", err);
    return res.status(500).json({ success: false, message: "Failed to fetch dosha profile" });
  }
};