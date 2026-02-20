import { body } from "express-validator";

export const registerValidation = [
  body("full_name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be 2-100 characters"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number"),

  body("gender")
    .optional()
    .isIn(["male", "female", "other", "prefer_not_to_say"])
    .withMessage("Invalid gender value"),
];

export const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];