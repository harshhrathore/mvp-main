import { pool } from "../config/db";
import { SessionRow, MessageRow } from "../types";

// ── SESSION 
export const createSession = async (
  userId: string,
  sessionType: string = "regular"
): Promise<SessionRow> => {
  const { rows } = await pool.query<SessionRow>(
    `INSERT INTO conversation_sessions (user_id, session_type)
     VALUES ($1, $2)
     RETURNING *`,
    [userId, sessionType]
  );
  return rows[0];
};

export const endSession = async (sessionId: string): Promise<void> => {
  await pool.query(
    `UPDATE conversation_sessions
     SET end_time = CURRENT_TIMESTAMP,
         duration_seconds = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - start_time))::INT
     WHERE session_id = $1`,
    [sessionId]
  );
};

export const getActiveSession = async (userId: string): Promise<SessionRow | undefined> => {
  const { rows } = await pool.query<SessionRow>(
    `SELECT * FROM conversation_sessions
     WHERE user_id = $1 AND end_time IS NULL
     ORDER BY start_time DESC
     LIMIT 1`,
    [userId]
  );
  return rows[0];
};

// ── MESSAGE 
export const saveMessage = async (
  sessionId: string,
  userId: string,
  seqNum: number,
  fields: {
    input_type: string;
    transcript_text?: string | null;
    audio_file_url?: string | null;
    transcript_confidence?: number | null;
    ai_response_text?: string | null;
    ai_response_audio_url?: string | null;
    response_emotion_tone?: string | null;
    time_of_day?: string | null;
    detected_context?: string | null;
  }
): Promise<MessageRow> => {
  const { rows } = await pool.query<MessageRow>(
    `INSERT INTO conversation_messages
       (session_id, user_id, sequence_number, input_type,
        transcript_text, audio_file_url, transcript_confidence,
        ai_response_text, ai_response_audio_url, response_emotion_tone,
        time_of_day, detected_context)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      sessionId, userId, seqNum, fields.input_type,
      fields.transcript_text || null,
      fields.audio_file_url || null,
      fields.transcript_confidence || null,
      fields.ai_response_text || null,
      fields.ai_response_audio_url || null,
      fields.response_emotion_tone || null,
      fields.time_of_day || null,
      fields.detected_context || null,
    ]
  );
  return rows[0];
};

// ── HISTORY — last N turns formatted for OpenAI ───────
export const getConversationHistory = async (
  sessionId: string,
  limit: number = 5
): Promise<{ role: "user" | "assistant"; content: string }[]> => {
  const { rows } = await pool.query<MessageRow>(
    `SELECT * FROM conversation_messages
     WHERE session_id = $1
     ORDER BY sequence_number DESC
     LIMIT $2`,
    [sessionId, limit]
  );

  // Reverse so oldest-first, then flatten into OpenAI format
  const history: { role: "user" | "assistant"; content: string }[] = [];
  for (const row of rows.reverse()) {
    if (row.transcript_text) history.push({ role: "user", content: row.transcript_text });
    if (row.ai_response_text) history.push({ role: "assistant", content: row.ai_response_text });
  }
  return history;
};

// ── GET NEXT sequence number for a session 
export const getNextSeqNum = async (sessionId: string): Promise<number> => {
  const { rows } = await pool.query<{ max: number | null }>(
    `SELECT MAX(sequence_number) as max FROM conversation_messages WHERE session_id = $1`,
    [sessionId]
  );
  return (rows[0]?.max || 0) + 1;
};