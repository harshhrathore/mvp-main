import axios from 'axios';
import { EmotionResult } from '../types';

// ─── EMOTION TO DOSHA MAPPING ───
const EMOTION_DOSHA_MAP: Record<string, { vata: number; pitta: number; kapha: number }> = {
  anxiety: { vata: 0.8, pitta: 0.1, kapha: 0.1 },
  fear: { vata: 0.7, pitta: 0.2, kapha: 0.1 },
  anger: { vata: 0.1, pitta: 0.8, kapha: 0.1 },
  frustration: { vata: 0.15, pitta: 0.75, kapha: 0.1 },
  sadness: { vata: 0.3, pitta: 0.1, kapha: 0.6 },
  joy: { vata: 0.33, pitta: 0.33, kapha: 0.34 },
  peace: { vata: 0.2, pitta: 0.3, kapha: 0.5 },
  lethargy: { vata: 0.05, pitta: 0.1, kapha: 0.85 },
  neutral: { vata: 0.33, pitta: 0.33, kapha: 0.34 },
};

interface BertApiResponse {
  primary_emotion?: string;
  primary?: string;
  confidence?: number;
  all_emotions?: Record<string, number>;
  intensity?: number;
}

/**
 * Detect emotion via AI team's BERT API
 * Falls back to keywords if API unavailable
 */
export const detectEmotion = async (text: string): Promise<EmotionResult> => {
  const bertUrl = process.env.BERT_API_URL;
  const bertKey = process.env.BERT_API_KEY;

  if (bertUrl && bertKey) {
    try {
      const response = await axios.post<BertApiResponse>(
        bertUrl,
        { text },
        {
          headers: {
            'Authorization': `Bearer ${bertKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      );

      const data = response.data;
      return {
        primary_emotion: data.primary_emotion || data.primary || 'neutral',
        primary_confidence: data.confidence || 0.5,
        all_emotions: data.all_emotions || {},
        emotion_intensity: data.intensity || Math.round((data.confidence || 0.5) * 10),
      };
    } catch (error) {
      console.error('[emotion] BERT API error, using fallback:', error);
    }
  }

  return fallbackEmotionDetection(text);
};

/**
 * Simple keyword fallback (used when BERT API is down)
 */
const fallbackEmotionDetection = (text: string): EmotionResult => {
  const lower = text.toLowerCase();

  const keywords: Record<string, string[]> = {
    anxiety: ['worried', 'anxious', 'nervous', 'scared', 'panic', 'stressed', 'overwhelmed'],
    anger: ['angry', 'mad', 'frustrated', 'annoyed', 'furious', 'irritated'],
    sadness: ['sad', 'depressed', 'down', 'unhappy', 'hopeless', 'lonely'],
    joy: ['happy', 'excited', 'wonderful', 'great', 'amazing', 'joyful'],
    fear: ['afraid', 'terrified', 'frightened', 'fearful'],
    peace: ['calm', 'peaceful', 'relaxed', 'serene'],
    lethargy: ['tired', 'exhausted', 'fatigue', 'sluggish', 'drained'],
  };

  for (const [emotion, words] of Object.entries(keywords)) {
    if (words.some((w) => lower.includes(w))) {
      return {
        primary_emotion: emotion,
        primary_confidence: 0.6,
        all_emotions: { [emotion]: 0.6 },
        emotion_intensity: 5,
      };
    }
  }

  return {
    primary_emotion: 'neutral',
    primary_confidence: 0.5,
    all_emotions: { neutral: 0.5 },
    emotion_intensity: 3,
  };
};

/**
 * Map emotion to dosha impact
 */
export const emotionToDoshaImpact = (emotion: string): { vata: number; pitta: number; kapha: number } => {
  const lower = emotion.toLowerCase();
  return EMOTION_DOSHA_MAP[lower] || EMOTION_DOSHA_MAP.neutral;
};