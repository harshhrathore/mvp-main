import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";


export interface AuthRequest extends Request {
  user?: { userId: string };
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }

  const token = header.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
    return;
  }

  req.user = decoded;
  next();
};