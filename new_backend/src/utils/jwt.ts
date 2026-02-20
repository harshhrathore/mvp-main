import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, env.jwtSecret(), { expiresIn: "7d" });
};

export const verifyToken = (
  token: string
): { userId: string } | null => {
  try {
    return jwt.verify(token, env.jwtSecret()) as { userId: string };
  } catch {
    return null;
  }
}