import axios from 'axios';
import { KnowledgeRow } from '../types';
import { env } from '../config/env';
import { SAMAPersonalityEngine, SAMAPromptParams } from './samaPersonalityEngine';
import { crossSessionContextService } from './crossSessionContextService';
import { getPreferences } from './preferencesService';
import { findUserById } from './userService';

interface AIResponseParams {
  userId: string;
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
    scores: { vata: number; pitta: number; kapha: number };
  } | null;
  knowledge: KnowledgeRow[];
  history: { role: 'user' | 'assistant'; content: string }[];
  doshaHistory?: {
    today?: { dosha: string; intensity: number };
    yesterday?: { dosha: string; intensity: number };
  };
  userPreferences?: {
    nickname: string | null;
    name: string;
    language: string;
    emotional_attachment: number;
  };
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const FALLBACK_RESPONSES: Record<string, string> = {
  anxiety: "I sense you're feeling anxious. Take a deep breath — this helps calm Vata energy.",
  anger: "I hear your frustration. Cooling breath can help balance Pitta.",
  sadness: "I'm sorry you're feeling down. It's okay to feel this way.",
  fear: "Fear often relates to Vata imbalance. Grounding practices can help.",
  joy: "It's wonderful you're feeling good! Embrace this moment.",
  peace: "It's beautiful that you're feeling peaceful.",
  lethargy: "Low energy can signal Kapha imbalance. Gentle movement might help.",
  neutral: "Thank you for sharing. How can I support you today?",
};

const getFallbackSAMAResponse = (emotion: string, nickname?: string | null): string => {
  const name = nickname || 'friend';
  const baseResponse = FALLBACK_RESPONSES[emotion.toLowerCase()] || FALLBACK_RESPONSES.neutral;
  const samaResponses = [
    `I'm having a little trouble gathering my thoughts right now, ${name}. ${baseResponse}`,
    `My mind is a bit foggy at the moment, ${name}. ${baseResponse}`,
    `I need a moment to center myself, ${name}. ${baseResponse}`,
  ];
  return samaResponses[Math.floor(Math.random() * samaResponses.length)];
};

export const generateAIResponse = async (params: AIResponseParams): Promise<string> => {
  const openaiKey = env.openaiKey();
  const openaiModel = env.openaiModel();

  if (openaiKey) {
    try {
      const crossSessionMessages = await crossSessionContextService.getRecentMessages(params.userId, 2);
      const crossSessionContext = crossSessionContextService.formatForPrompt(crossSessionMessages);

      const preferences = await getPreferences(params.userId);
      const user = await findUserById(params.userId);

      const userPreferences = {
        nickname: (preferences as any).nickname || null,
        name: user?.full_name || 'friend',
        language: (preferences as any).preferred_language || 'English',
        emotional_attachment: (preferences as any).emotional_attachment || 7,
      };

      const samaParams: SAMAPromptParams = {
        userMessage: params.userMessage,
        emotion: params.emotion,
        doshaProfile: params.doshaProfile,
        vikriti: params.vikriti,
        knowledge: params.knowledge,
        history: params.history,
        userPreferences,
        crossSessionContext,
        doshaHistory: params.doshaHistory || {},
      };

      const samaEngine = new SAMAPersonalityEngine();
      const systemPrompt = samaEngine.buildSystemPrompt(samaParams);

      const messages = [
        { role: 'system', content: systemPrompt },
        ...params.history,
        { role: 'user', content: params.userMessage }
      ];

      const response = await axios.post<OpenAIResponse>(
        'https://api.openai.com/v1/chat/completions',
        {
          model: openaiModel,
          messages: messages,
          temperature: 0.7,
          max_tokens: 300,
        },
        {
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const aiReply = response.data.choices?.[0]?.message?.content;
      if (aiReply) return aiReply.trim();

      console.error('[OpenAI] No reply in response:', JSON.stringify(response.data));

    } catch (error: any) {
      console.error('[OpenAI] Error:', {
        userId: params.userId,
        emotion: params.emotion.primary_emotion,
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return getFallbackSAMAResponse(params.emotion.primary_emotion, params.userPreferences?.nickname);
};

export const getAIResponse = async (message: string, userId: string, _context?: string): Promise<string> => {
  return generateAIResponse({
    userId,
    userMessage: message,
    emotion: { primary_emotion: 'neutral', emotion_intensity: 5 },
    doshaProfile: null,
    vikriti: null,
    knowledge: [],
    history: [],
  });
};