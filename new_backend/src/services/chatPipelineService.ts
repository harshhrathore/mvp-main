/**
 * CHAT PIPELINE SERVICE
 * 
 *   1. Detect emotion (BERT → keyword fallback)
 *   2. Safety scan (crisis keywords)
 *   3. Pull user's dosha profile
 *   4. Calculate vikriti (current imbalance)
 *   5. Search knowledge base (RAG)
 *   6. Build GPT-4 prompt & get reply
 *   7. Build recommendations
 *   8. Persist: message, emotion, safety, recommendations, dosha tracking, streak
 *   9. Return the full response object to the controller
 */

import { detectEmotion, emotionToDoshaImpact } from "./emotionService";
import { detectCrisis, logSafetyEvent, buildCrisisResponse } from "./safetyService";
import { getLatestAssessment, saveDoshaTracking } from "./doshaService";
import { searchKnowledge } from "./knowledgeService";
import { generateAIResponse } from "./aiService";
import { saveEmotionAnalysis } from "./emotionAnalysisService";
import {
  createSession,
  getActiveSession,
  saveMessage,
  getConversationHistory,
  getNextSeqNum,
} from "./chatService";
import {
  buildRecommendations,
  saveRecommendations,
} from "./recommendationService";
import { updateStreak } from "./streakService";
import { getTimeOfDay, scoreTo10, maxKey } from "../utils/helpers";
import { DoshaScores, KnowledgeRow } from "../types";

// ── PUBLIC INPUT/OUTPUT types
export interface PipelineInput {
  userId: string;
  message: string;           // transcript text (from voice or typed)
  inputType: "text" | "voice";
  audioUrl?: string;         // original audio URL if voice
}

export interface PipelineOutput {
  ai_response_text: string;
  emotion: {
    primary: string;
    intensity: number;
  };
  recommendations: {
    knowledge_id: string;
    title: string;
    content_type: string;
    duration_minutes: number | null;
    why: string;
  }[];
  is_crisis: boolean;
  crisis_level: string;
  session_id: string;
  message_id: string;
}

// ── MAIN ENTRY 
export const processChatMessage = async (
  input: PipelineInput
): Promise<PipelineOutput> => {
  const { userId, message, inputType, audioUrl } = input;
  const timeOfDay = getTimeOfDay();

  try {
    // ─ 1. Emotion detection 
    const emotion = await detectEmotion(message);

    // ─ 2. Safety scan 
    const safetyCheck = detectCrisis(message);

    // ─ 3. Session: reuse active or create new 
    let session;
    try {
      session = await getActiveSession(userId);
      if (!session) {
        session = await createSession(userId, "regular");
      }
    } catch (dbError: any) {
      console.error('[chatPipeline] Database error getting/creating session:', {
        userId,
        error: dbError.message,
        stack: dbError.stack,
        timestamp: new Date().toISOString(),
      });
      throw new Error('Failed to initialize chat session');
    }
    
    const sessionId = session.session_id;

    // ─ 4. Sequence number + persist the user message
    let seqNum: number;
    let msgRow;
    try {
      seqNum = await getNextSeqNum(sessionId);
      msgRow = await saveMessage(sessionId, userId, seqNum, {
        input_type: inputType,
        transcript_text: message,
        audio_file_url: audioUrl || null,
        time_of_day: timeOfDay,
      });
    } catch (dbError: any) {
      console.error('[chatPipeline] Database error saving user message:', {
        userId,
        sessionId,
        error: dbError.message,
        stack: dbError.stack,
        timestamp: new Date().toISOString(),
      });
      throw new Error('Failed to save message');
    }
    
    const messageId = msgRow.message_id;

    // ─ 5. Persist emotion analysis 
    try {
      await saveEmotionAnalysis(messageId, userId, emotion);
    } catch (dbError: any) {
      console.error('[chatPipeline] Database error saving emotion analysis:', {
        userId,
        messageId,
        emotion: emotion.primary_emotion,
        error: dbError.message,
        stack: dbError.stack,
        timestamp: new Date().toISOString(),
      });
      // Non-critical - continue processing
    }

    // ─ 6. Safety log if crisis detected
    if (safetyCheck.is_crisis) {
      try {
        await logSafetyEvent(userId, messageId, safetyCheck);
      } catch (dbError: any) {
        console.error('[chatPipeline] Database error logging safety event:', {
          userId,
          messageId,
          crisisLevel: safetyCheck.crisis_level,
          error: dbError.message,
          stack: dbError.stack,
          timestamp: new Date().toISOString(),
        });
        // Non-critical - continue processing
      }
      // Continue processing through SAMA personality with Psychologist_Mode
      // The mode will be automatically detected by SAMAPersonalityEngine.detectMode()
    }

    // ─ 7. Dosha profile 
    let assessment;
    try {
      assessment = await getLatestAssessment(userId);
    } catch (dbError: any) {
      console.error('[chatPipeline] Database error getting dosha assessment:', {
        userId,
        error: dbError.message,
        stack: dbError.stack,
        timestamp: new Date().toISOString(),
      });
      assessment = null; // Continue without dosha profile
    }
    
    const doshaProfile = assessment
      ? { primary_dosha: assessment.primary_dosha, prakriti_scores: assessment.prakriti_scores as Record<string, number> }
      : null;

    // ─ 8. Vikriti calculation 
    const emotionImpact = emotionToDoshaImpact(emotion.primary_emotion);
    let vikriti: { dominant: string; scores: DoshaScores } | null = null;

    if (doshaProfile) {
      const p = doshaProfile.prakriti_scores;
      const scores: DoshaScores = {
        vata:  parseFloat(((p.vata || 0) * 0.7 + emotionImpact.vata * 0.3).toFixed(3)),
        pitta: parseFloat(((p.pitta || 0) * 0.7 + emotionImpact.pitta * 0.3).toFixed(3)),
        kapha: parseFloat(((p.kapha || 0) * 0.7 + emotionImpact.kapha * 0.3).toFixed(3)),
      };
      vikriti = { dominant: maxKey(scores), scores };

      // Persist today's dosha tracking (upsert)
      try {
        const intensity = scoreTo10(Math.max(scores.vata, scores.pitta, scores.kapha));
        await saveDoshaTracking(userId, scores, vikriti.dominant, intensity, emotion.primary_emotion);
      } catch (dbError: any) {
        console.error('[chatPipeline] Database error saving dosha tracking:', {
          userId,
          dominant: vikriti.dominant,
          error: dbError.message,
          stack: dbError.stack,
          timestamp: new Date().toISOString(),
        });
        // Non-critical - continue processing
      }
    }

    // ─ 9. Knowledge search (RAG) 
    const dominantDosha = vikriti?.dominant || doshaProfile?.primary_dosha || "Vata";
    let knowledge: KnowledgeRow[];
    try {
      knowledge = await searchKnowledge({
        emotion: emotion.primary_emotion,
        dosha: dominantDosha,
        timeOfDay,
        limit: 3,
      });
    } catch (dbError: any) {
      console.error('[chatPipeline] Database error searching knowledge:', {
        userId,
        emotion: emotion.primary_emotion,
        dosha: dominantDosha,
        error: dbError.message,
        stack: dbError.stack,
        timestamp: new Date().toISOString(),
      });
      knowledge = []; // Continue without knowledge
    }

    // ─ 10. Conversation history (last 5 turns) 
    let history: { role: 'user' | 'assistant'; content: string }[];
    try {
      history = await getConversationHistory(sessionId, 5);
    } catch (dbError: any) {
      console.error('[chatPipeline] Database error getting conversation history:', {
        userId,
        sessionId,
        error: dbError.message,
        stack: dbError.stack,
        timestamp: new Date().toISOString(),
      });
      history = []; // Continue without history
    }

    // ─ 11. GPT-4 response
    const aiText = await generateAIResponse({
      userId,
      userMessage: message,
      emotion: { primary_emotion: emotion.primary_emotion, emotion_intensity: emotion.emotion_intensity },
      doshaProfile,
      vikriti,
      knowledge,
      history,
    });

    // ─ 12. Build recommendations 
    const recs = buildRecommendations(knowledge, emotion.primary_emotion, dominantDosha);

    // ─ 13. Persist AI response message 
    try {
      await saveMessage(sessionId, userId, seqNum + 1, {
        input_type: "text",
        ai_response_text: aiText,
        response_emotion_tone: emotion.primary_emotion,
        time_of_day: timeOfDay,
      });
    } catch (dbError: any) {
      console.error('[chatPipeline] Database error saving AI response:', {
        userId,
        sessionId,
        error: dbError.message,
        stack: dbError.stack,
        timestamp: new Date().toISOString(),
      });
      // Non-critical - user still gets the response
    }

    // ─ 14. Persist recommendations 
    if (recs.length > 0) {
      try {
        await saveRecommendations(userId, sessionId, recs, emotion.primary_emotion, dominantDosha);
      } catch (dbError: any) {
        console.error('[chatPipeline] Database error saving recommendations:', {
          userId,
          sessionId,
          recsCount: recs.length,
          error: dbError.message,
          stack: dbError.stack,
          timestamp: new Date().toISOString(),
        });
        // Non-critical - user still gets recommendations in response
      }
    }

    // ─ 15. Update streak 
    try {
      await updateStreak(userId);
    } catch (dbError: any) {
      console.error('[chatPipeline] Database error updating streak:', {
        userId,
        error: dbError.message,
        stack: dbError.stack,
        timestamp: new Date().toISOString(),
      });
      // Non-critical - continue
    }

    // ─ 16. Return 
    return {
      ai_response_text: aiText,
      emotion: { primary: emotion.primary_emotion, intensity: emotion.emotion_intensity },
      recommendations: recs,
      is_crisis: safetyCheck.is_crisis,
      crisis_level: safetyCheck.crisis_level,
      session_id: sessionId,
      message_id: messageId,
    };
  } catch (error: any) {
    // Top-level error handler for critical failures
    console.error('[chatPipeline] Critical error in processChatMessage:', {
      userId,
      inputType,
      messageLength: message?.length || 0,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    
    // Re-throw to be handled by controller
    throw error;
  }
};