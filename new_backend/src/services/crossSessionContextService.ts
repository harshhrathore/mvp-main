import { pool as defaultPool } from "../config/db";

export interface CrossSessionMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  session_id: string;
}

export class CrossSessionContextService {
  private pool: any;

  constructor(pool?: any) {
    this.pool = pool || defaultPool;
  }

  /**
   * Retrieve messages from the last N days for a user
   * @param userId - The user's ID
   * @param days - Number of days to look back (default: 2)
   * @returns Array of messages with role, content, timestamp, and session_id
   */
  async getRecentMessages(userId: string, days: number = 2): Promise<CrossSessionMessage[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const query = `
      SELECT 
        session_id,
        transcript_text,
        ai_response_text,
        created_at
      FROM conversation_messages
      WHERE user_id = $1 
        AND created_at >= $2
      ORDER BY created_at ASC
    `;

    const { rows } = await this.pool.query(query, [userId, cutoffDate]);

    // Convert database rows to message format
    const messages: CrossSessionMessage[] = [];
    
    for (const row of rows) {
      // Add user message if it exists
      if (row.transcript_text) {
        messages.push({
          role: 'user',
          content: row.transcript_text,
          timestamp: row.created_at,
          session_id: row.session_id
        });
      }
      
      // Add AI response if it exists
      if (row.ai_response_text) {
        messages.push({
          role: 'assistant',
          content: row.ai_response_text,
          timestamp: row.created_at,
          session_id: row.session_id
        });
      }
    }

    return messages;
  }

  /**
   * Format messages for AI prompt context
   * @param messages - Array of CrossSessionMessage objects
   * @returns Array formatted for OpenAI chat completion API
   */
  formatForPrompt(messages: CrossSessionMessage[]): { role: 'user' | 'assistant'; content: string }[] {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * Get recent messages by emotion for context-aware responses
   * @param userId - The user's ID
   * @param emotion - The emotion to filter by
   * @param limit - Maximum number of messages to return
   * @returns Array of messages with the specified emotion
   */
  async getRecentMessagesByEmotion(
    userId: string, 
    emotion: string, 
    limit: number = 10
  ): Promise<CrossSessionMessage[]> {
    const query = `
      SELECT 
        cm.session_id,
        cm.transcript_text,
        cm.ai_response_text,
        cm.created_at
      FROM conversation_messages cm
      JOIN emotion_analysis ea ON cm.message_id = ea.message_id
      WHERE cm.user_id = $1 
        AND ea.primary_emotion = $2
      ORDER BY cm.created_at DESC
      LIMIT $3
    `;

    const { rows } = await this.pool.query(query, [userId, emotion, limit]);

    const messages: CrossSessionMessage[] = [];
    
    for (const row of rows) {
      if (row.transcript_text) {
        messages.push({
          role: 'user',
          content: row.transcript_text,
          timestamp: row.created_at,
          session_id: row.session_id
        });
      }
      
      if (row.ai_response_text) {
        messages.push({
          role: 'assistant',
          content: row.ai_response_text,
          timestamp: row.created_at,
          session_id: row.session_id
        });
      }
    }

    return messages.reverse(); // Return in chronological order
  }
}

// Export singleton instance
export const crossSessionContextService = new CrossSessionContextService();
