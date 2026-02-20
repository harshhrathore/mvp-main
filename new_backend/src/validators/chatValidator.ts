import { body } from "express-validator";

// ── POST /api/chat/message 
export const chatMessageValidation = [
  body("message")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Message max 2000 characters"),

  body("inputType")
    .isIn(["text", "voice"])
    .withMessage("inputType must be 'text' or 'voice'"),

  body("audioUrl")
    .optional()
    .isURL()
    .withMessage("audioUrl must be a valid URL"),
];

// ── POST /api/checkin 
export const checkinValidation = [
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Check-in text is required")
    .isLength({ max: 1000 })
    .withMessage("Text max 1000 characters"),

  body("emotion")
    .trim()
    .notEmpty()
    .withMessage("Emotion is required"),

  body("sleep_quality")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("sleep_quality 1-10"),

  body("energy_levels")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("energy_levels 1-10"),

  body("stress_level")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("stress_level 1-10"),
];

// ── POST /api/onboarding/health-baseline 
export const healthBaselineValidation = [
  body("sleep").isInt({ min: 1, max: 10 }).withMessage("sleep 1-10"),
  body("energy").isInt({ min: 1, max: 10 }).withMessage("energy 1-10"),
  body("appetite").isInt({ min: 1, max: 10 }).withMessage("appetite 1-10"),
  body("pain").isInt({ min: 0, max: 10 }).withMessage("pain 0-10"),
  body("medications")
    .optional()
    .isArray()
    .withMessage("medications must be an array"),
];