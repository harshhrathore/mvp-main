/**
 * Python Chat Controller
 *
 * Bridges the Node.js API gateway and sama-wellness-backend-main (Python FastAPI).
 *
 * Frontend sends:  POST /api/chat/message  { message, inputType, session_id? }
 * Python expects:  POST /api/daily_checkin/chat  { text, user_id, session_id? }
 * Python returns:  { message, user_id, session_id, timestamp }
 * Frontend expects: { success, data: { reply, emotion, recommendations, is_crisis, crisis_level, meta } }
 */

import { Response } from "express";
import axios, { AxiosError } from "axios";
import { AuthRequest } from "../middleware/authMiddleware";

const PYTHON_SERVICE_URL = process.env.CHECKIN_CHAT_URL || "http://localhost:8000";

export const sendMessageToPython = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const { message, session_id, sessionId } = req.body;

    // Accept both camelCase and snake_case session ID from frontend
    const activeSessionId = session_id || sessionId || undefined;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
        return res.status(400).json({ success: false, message: "Message is required" });
    }

    try {
        // Transform to Python API format
        // Only include session_id if it exists (Python Pydantic is strict about null vs missing)
        const pythonPayload: Record<string, any> = {
            text: message.trim(),
            user_id: userId,
        };

        if (activeSessionId) {
            pythonPayload.session_id = activeSessionId;
        }

        console.log(`[chat→python] POST ${PYTHON_SERVICE_URL}/api/daily_checkin/chat`, {
            userId,
            session_id: activeSessionId,
            messageLength: message.length,
        });

        const response = await axios.post(
            `${PYTHON_SERVICE_URL}/api/daily_checkin/chat`,
            pythonPayload,
            {
                headers: { "Content-Type": "application/json" },
                timeout: 60000, // 60s — LLM can be slow
            }
        );

        const pythonData = response.data;
        // Python CheckinResponse: { message, user_id, session_id, timestamp }

        return res.json({
            success: true,
            data: {
                reply: pythonData.message,
                emotion: { primary: "neutral", intensity: 5 }, // Python handles emotion internally
                recommendations: [],
                is_crisis: false,
                crisis_level: "none",
                meta: {
                    session_id: pythonData.session_id || activeSessionId || null,
                    message_id: `py-${Date.now()}`,
                },
            },
        });
    } catch (error: any) {
        const axiosErr = error as AxiosError;

        if (axiosErr.code === "ECONNREFUSED" || axiosErr.code === "ENOTFOUND") {
            console.error("[chat→python] Python service is not running:", PYTHON_SERVICE_URL);
            return res.status(503).json({
                success: false,
                message: "Chat service is currently unavailable. Please try again later.",
            });
        }

        if (axiosErr.code === "ETIMEDOUT" || axiosErr.code === "ECONNABORTED") {
            console.error("[chat→python] Python service timed out");
            return res.status(504).json({
                success: false,
                message: "Chat service took too long to respond. Please try again.",
            });
        }

        if (axiosErr.response) {
            const status = axiosErr.response.status;
            let detail = (axiosErr.response.data as any)?.detail || "Error from chat service";

            // If detail is an array/object (Pydantic validation errors), stringify it or take the first message
            if (typeof detail === 'object') {
                detail = JSON.stringify(detail);
            }

            console.error(`[chat→python] Python returned ${status}:`, detail);
            return res.status(status >= 500 ? 502 : status).json({
                success: false,
                message: detail, // Ensure string
            });
        }

        console.error("[chat→python] Unexpected error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again.",
        });
    }
};
