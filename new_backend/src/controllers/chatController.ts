import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { processChatMessage } from "../services/chatPipelineService";
import { endSession, getActiveSession } from "../services/chatService";

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST /api/chat/message
// Body: { message, inputType, audioUrl?, sessionId? }
export const sendMessage = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { message, inputType, audioUrl, sessionId } = req.body;

  // inputType defaults to "text" if not provided
  const type = inputType || "text";

  // Voice mode requires audioUrl; text mode requires message
  if (type === "voice" && !audioUrl) {
    return res.status(400).json({ success: false, message: "audioUrl is required for voice input" });
  }
  if (type === "text" && !message) {
    return res.status(400).json({ success: false, message: "message is required for text input" });
  }

  // Validate message length (1-2000 characters)
  if (type === "text" && message) {
    if (typeof message !== "string") {
      return res.status(400).json({ success: false, message: "message must be a string" });
    }
    if (message.trim().length === 0) {
      return res.status(400).json({ success: false, message: "message cannot be empty" });
    }
    if (message.length > 2000) {
      return res.status(400).json({ success: false, message: "message must be 2000 characters or less" });
    }
  }

  // Validate session_id format (UUID) if provided
  if (sessionId !== undefined && sessionId !== null) {
    if (typeof sessionId !== "string") {
      return res.status(400).json({ success: false, message: "sessionId must be a string" });
    }
    if (!UUID_REGEX.test(sessionId)) {
      return res.status(400).json({ success: false, message: "sessionId must be a valid UUID format" });
    }
  }

  try {
    const result = await processChatMessage({
      userId,
      message: message || "",   // voice will have transcript populated inside pipeline later
      inputType: type,
      audioUrl,
    });

    return res.json({
      success: true,
      data: {
        reply: result.ai_response_text,
        emotion: result.emotion,
        recommendations: result.recommendations,
        is_crisis: result.is_crisis,
        crisis_level: result.crisis_level,
        meta: {
          session_id: result.session_id,
          message_id: result.message_id,
        },
      },
    });
  } catch (err: any) {
    // Log full error details to server logs
    console.error('[chat] sendMessage error:', {
      userId,
      inputType: type,
      messageLength: message?.length || 0,
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    
    // Return generic 500 error to client
    return res.status(500).json({ 
      success: false, 
      message: "Something went wrong. Please try again." 
    });
  }
};

// POST /api/chat/end-session
export const endChatSession = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  try {
    const session = await getActiveSession(userId);
    if (!session) {
      return res.status(404).json({ success: false, message: "No active session found" });
    }
    await endSession(session.session_id);
    return res.json({ success: true, message: "Session ended", data: { session_id: session.session_id } });
  } catch (err: any) {
    // Log full error details to server logs
    console.error('[chat] endSession error:', {
      userId,
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    
    // Return generic 500 error to client
    return res.status(500).json({ 
      success: false, 
      message: "Something went wrong. Please try again." 
    });
  }
};

// GET /api/chat/session
// Returns the current active session info (or null)
export const getSession = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  try {
    const session = await getActiveSession(userId);
    return res.json({
      success: true,
      data: session
        ? { session_id: session.session_id, started_at: session.start_time, type: session.session_type }
        : null,
    });
  } catch (err: any) {
    // Log full error details to server logs
    console.error('[chat] getSession error:', {
      userId,
      error: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
    
    // Return generic 500 error to client
    return res.status(500).json({ 
      success: false, 
      message: "Something went wrong. Please try again." 
    });
  }
};