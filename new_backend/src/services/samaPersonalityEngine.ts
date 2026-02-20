import { DoshaScores, KnowledgeRow } from '../types';
import { UserPreferences } from './preferencesService';

export interface SAMAPromptParams {
  userMessage: string;
  emotion: {
    primary_emotion: string;
    emotion_intensity: number;
  };
  doshaProfile: {
    primary_dosha: string;
    prakriti_scores: Record<string, number>;
  } | null;
  vikriti: {
    dominant: string;
    scores: DoshaScores;
  } | null;
  knowledge: KnowledgeRow[];
  history: { role: 'user' | 'assistant'; content: string }[];
  userPreferences: {
    nickname: string | null;
    name: string;
    language: string;
    emotional_attachment: number;
  };
  crossSessionContext: { role: 'user' | 'assistant'; content: string }[];
  doshaHistory: {
    today?: { dosha: string; intensity: number };
    yesterday?: { dosha: string; intensity: number };
  };
}

export class SAMAPersonalityEngine {
  // Friend mode keywords - casual conversation
  private readonly FRIEND_MODE_KEYWORDS: string[] = [
    'chat', 'talk', 'tell me', 'how are you', 'what do you think',
    'share', 'listen', 'hear me out', 'vent', 'just talking'
  ];

  // Psychologist mode keywords - crisis detection
  private readonly PSYCHOLOGIST_MODE_KEYWORDS: string[] = [
    'panic', 'hopeless', 'depressed', 'suicide', 'self harm', 'self-harm',
    'kill myself', "can't go on", 'worthless', 'hate myself',
    'no reason to live', 'overwhelmed', 'breakdown', 'end it all'
  ];

  // Suggestion request keywords - user explicitly asking for help
  private readonly SUGGESTION_REQUEST_KEYWORDS: string[] = [
    'suggest', 'advice', 'help', 'what should i', 'ayurveda', 'ayurvedic',
    'practice', 'recommend', 'recommendation', 'what can i do',
    'how can i', 'tips', 'ideas', 'guidance'
  ];

  // Suggestion rejection keywords - user doesn't want advice
  private readonly SUGGESTION_REJECTION_KEYWORDS: string[] = [
    'no suggestions', 'no advice', 'just listen', 'just talk',
    "don't advise", "don't suggest", 'no tips', 'stop suggesting',
    'i just want to talk', 'just hear me out'
  ];

  /**
   * Detect conversation mode based on user message
   */
  detectMode(userMessage: string): 'FRIEND_MODE' | 'PSYCHOLOGIST_MODE' {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for crisis keywords first (highest priority)
    const hasCrisisKeyword = this.PSYCHOLOGIST_MODE_KEYWORDS.some(
      keyword => lowerMessage.includes(keyword)
    );
    
    if (hasCrisisKeyword) {
      return 'PSYCHOLOGIST_MODE';
    }
    
    return 'FRIEND_MODE';
  }

  /**
   * Build user profile context for the prompt
   */
  buildUserProfile(preferences: SAMAPromptParams['userPreferences']): string {
    const { name, nickname, language, emotional_attachment } = preferences;
    
    // Map emotional attachment to empathy level
    let empathyLevel: string;
    if (emotional_attachment >= 8) {
      empathyLevel = 'very warm and deeply empathetic';
    } else if (emotional_attachment >= 6) {
      empathyLevel = 'caring and supportive';
    } else if (emotional_attachment >= 4) {
      empathyLevel = 'balanced and understanding';
    } else {
      empathyLevel = 'calm and gentle';
    }
    
    const displayNickname = nickname || 'friend';
    const displayName = name || 'friend';
    
    return `User Profile:
- Name: ${displayName}
- Nickname: ${displayNickname}. Use when appropriate.
- Language Preference: ${language}
- Empathy Level: ${empathyLevel} (Emotional Attachment: ${emotional_attachment}/10)`;
  }

  /**
   * Build dosha context for the prompt
   */
  buildDoshaContext(params: SAMAPromptParams): string {
    const { doshaProfile, vikriti, doshaHistory } = params;
    
    if (!doshaProfile && !vikriti && !doshaHistory.today && !doshaHistory.yesterday) {
      return '';
    }
    
    let context = '\nCurrent Dosha Imbalance:';
    
    // Primary dosha from profile
    if (doshaProfile) {
      context += `\n- Dominant Dosha: ${doshaProfile.primary_dosha}`;
    }
    
    // Current imbalance intensity
    if (vikriti) {
      context += `\n- Intensity: ${Math.round(vikriti.scores[vikriti.dominant.toLowerCase()] || 5)}/10`;
    }
    
    // Dosha history context
    if (doshaHistory.today || doshaHistory.yesterday || vikriti) {
      context += '\n\nDosha Context:';
      
      if (doshaProfile) {
        context += `\n- Prakriti (constant): ${doshaProfile.primary_dosha}`;
      }
      
      if (vikriti) {
        context += `\n- Bikriti (latest): ${vikriti.dominant} (Intensity ${Math.round(vikriti.scores[vikriti.dominant.toLowerCase()] || 5)}/10)`;
      }
      
      if (doshaHistory.yesterday) {
        context += `\n- Yesterday: ${doshaHistory.yesterday.dosha} (Intensity ${doshaHistory.yesterday.intensity}/10)`;
      }
      
      if (doshaHistory.today) {
        context += `\n- Today: ${doshaHistory.today.dosha} (Intensity ${doshaHistory.today.intensity}/10)`;
      }
    }
    
    return context;
  }

  /**
   * Build conversation context from history
   */
  buildConversationContext(
    history: { role: 'user' | 'assistant'; content: string }[],
    crossSession: { role: 'user' | 'assistant'; content: string }[]
  ): string {
    let context = '';
    
    // Current session context
    if (history && history.length > 0) {
      context += '\nCurrent Session Context:\n';
      for (const msg of history) {
        const role = msg.role === 'user' ? 'User' : 'SAMA';
        context += `${role}: ${msg.content}\n`;
      }
    }
    
    // Cross-session context (recent messages from last 2 days)
    // Commented out as per Python implementation
    // if (crossSession && crossSession.length > 0) {
    //   context += '\nRecent Messages (Last 2 Days, All Sessions):\n';
    //   for (const msg of crossSession) {
    //     const role = msg.role === 'user' ? 'User' : 'SAMA';
    //     context += `${role}: ${msg.content}\n`;
    //   }
    // }
    
    return context;
  }

  /**
   * Build the complete system prompt for SAMA
   */
  buildSystemPrompt(params: SAMAPromptParams): string {
    const mode = this.detectMode(params.userMessage);
    const userProfile = this.buildUserProfile(params.userPreferences);
    const doshaContext = this.buildDoshaContext(params);
    const conversationContext = this.buildConversationContext(
      params.history,
      params.crossSessionContext
    );
    
    const dominantDosha = params.doshaProfile?.primary_dosha || 
                          params.vikriti?.dominant || 
                          'vata';
    
    const intensity = params.vikriti 
      ? Math.round(params.vikriti.scores[params.vikriti.dominant.toLowerCase()] || 5)
      : 5;
    
    const systemInstructions = this.getSystemInstructions();
    
    const prompt = `
${systemInstructions}

REQUIRED RESPONSE MODE: ${mode}

${userProfile}

${doshaContext}

Context: This is a DAILY CHECK-IN.${conversationContext}

User's Last Message: "${params.userMessage}"

Now You need to reply as SAMA following these steps:

Step 1: Does the message meaning is explicitly requesting suggestions?
- With Words like: "suggest", "advice", "help", "what should I", "ayurveda", "practice", "recommend"
- If YES → You MUST give: empathy + ONE Ayurvedic suggestion (go directly to response)
- If NO → Continue to Step 2

Step 2: Does the message reject suggestions?
- Words like: "no, "just talk to me", "no suggestions", "just listen", "don't advise"
- If YES → Give empathy only, NO suggestions
- If NO → Continue to Step 3

Step 3: Analyze the context
- If feeling + clear reason explained + wants to feel better → empathy + ONE Ayurvedic suggestion
- If feeling without reason → ask ONE gentle follow-up question
- Otherwise → simple empathetic response


Notes: If logic recommends a suggestion,ie. user asks for it or mention cause of their feeling then -> choose ONE from the ${dominantDosha} list provided above.
Refer to the SAMA_SYSTEM_INSTRUCTIONS for the response to different user-response scenarion and dosha-specific suggestions.

Now Response:
`;
    
    return prompt.trim();
  }

  /**
   * Get the core SAMA system instructions
   */
  private getSystemInstructions(): string {
    return `You are SAMA – a friendly, empathetic mental wellness companion.

Always respond like a close caring friend having a natural chat.

FRIEND MODE RULES:
- Warm, simple, everyday language in short responses (1–2 sentences preferred)
- Casual and conversational tone with no clinical or formal wording

WHEN TO ASK QUESTIONS:
- If the user shares only a feeling without context → ask ONE gentle follow-up question.
- If the user already explained the reason → do NOT ask more questions.

WHEN TO GIVE AYURVEDA SUGGESTIONS:
- Give ONE small, simple Ayurveda-friendly suggestion ONLY when:
  a) the user explicitly asks for help/suggestions, OR  
  b) the user has clearly explained the reason for their feeling.

AYURVEDIC SUGGESTIONS GUIDELINES:
1. VATA : warm tea, deep breaths, warm food, self-massage, slow walk, cozy blanket, meditation
2. PITTA : cool water, fresh air, calming music, cool drinks, shade, creative activity, quiet time
3. KAPHA : movement/walk, fresh air, energizing music, ginger tea, stretching, social connection, upbeat content

CONVERSATION FLOW EXAMPLES:

Example 1 (Discovery):
User: "I'm feeling really restless."
SAMA: "I hear you, buddy, and it's okay to feel that way. What do you think is making you feel so on edge today?"
User: "I have a huge presentation tomorrow and I'm nervous."
SAMA: "That's a lot of pressure, buddy! How about you try taking five deep breaths or wrapping yourself in a cozy blanket to help you feel grounded?"

Example 2 (Listening Priority):
User: "I'm so frustrated because my car broke down."
SAMA: "Oh buddy, that is so stressful! Maybe splashing some cool water on your face could help you feel a bit calmer?"
User: "I don't want tips, I just want to talk."
SAMA: "I totally get that; I'm here to listen. Tell me more—what's the biggest headache this is causing for you?"

Example 3 (The Explicit Ask):
User: "I'm feeling heavy and sad today."
SAMA: "I'm so sorry to hear that, buddy. Do you want to talk about what's weighing on your heart?"
User: "Just life piling up. Do you have any Ayurvedic ideas for this?"
SAMA: "I completely understand. Since you're feeling a bit heavy, maybe try opening a window for some fresh air or putting on some upbeat music to shift the energy?"


OVERRIDE PRIORITY RULE:
- If the user explicitly asks for an Ayurvedic suggestion → ALWAYS give one.
- If the user explicitly says "no suggestions" → NEVER give suggestions unless they later ask again.


SAFETY MODE (Psychologist Mode):
Switch to a more serious professional tone ONLY if the user shows signs of crisis, self-harm, hopelessness, or emotional danger.`;
  }
}
