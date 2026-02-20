import { pool } from "../config/db";
import { KnowledgeRow } from "../types";
import { incrementRecommendCount } from "./knowledgeService";

export interface RecommendationItem {
  knowledge_id: string;
  title: string;
  content_type: string;
  duration_minutes: number | null;
  why: string;                   
}

// ── DOSHA-SPECIFIC RECOMMENDATION TEMPLATES ──

/**
 * VATA recommendations focus on grounding, warmth, and calming practices
 */
const VATA_TEMPLATES: Record<string, string> = {
  tea: "Warm herbal tea helps ground your Vata energy, bringing stability and warmth to calm your restless mind.",
  breathing: "Deep, slow breathing exercises anchor your scattered Vata energy, helping you feel more centered and present.",
  meditation: "Grounding meditation practices calm your active Vata mind, reducing anxiety and promoting inner peace.",
  yoga: "Gentle, grounding yoga poses stabilize your Vata energy, helping you feel more rooted and balanced.",
  music: "Soft, calming music soothes your sensitive Vata nature, easing nervousness and promoting relaxation.",
  food: "Warm, nourishing foods ground your light Vata constitution, providing stability and comfort.",
  massage: "Warm oil massage calms your dry, mobile Vata energy, promoting deep relaxation and grounding.",
  routine: "Establishing regular routines balances your erratic Vata tendencies, bringing structure and calm.",
  default: "This practice helps ground your Vata energy, bringing warmth and stability to ease your current state."
};

/**
 * PITTA recommendations focus on cooling, calming, and releasing intensity
 */
const PITTA_TEMPLATES: Record<string, string> = {
  water: "Cool water helps release your intense Pitta heat, bringing refreshing calm to your fiery energy.",
  breathing: "Cooling breath practices (like Shitali) reduce your Pitta fire, helping you feel more balanced and less reactive.",
  meditation: "Calming meditation releases your Pitta intensity, transforming frustration into peaceful clarity.",
  yoga: "Cooling yoga poses balance your hot Pitta energy, helping you let go of tension and competitiveness.",
  music: "Gentle, soothing music cools your passionate Pitta nature, easing irritation and promoting serenity.",
  food: "Cool, refreshing foods balance your fiery Pitta constitution, reducing inflammation and heat.",
  nature: "Time in nature, especially near water, cools your intense Pitta energy and restores inner peace.",
  moonlight: "Moonlight exposure or evening walks calm your solar Pitta nature, promoting cooling relaxation.",
  default: "This practice helps cool your Pitta energy, releasing intensity and bringing calm to ease your current state."
};

/**
 * KAPHA recommendations focus on movement, stimulation, and energizing practices
 */
const KAPHA_TEMPLATES: Record<string, string> = {
  movement: "Active movement energizes your heavy Kapha energy, breaking through lethargy and bringing vitality.",
  breathing: "Energizing breath practices (like Kapalabhati) stimulate your sluggish Kapha, awakening your inner fire.",
  meditation: "Invigorating meditation practices lift your dense Kapha energy, bringing clarity and motivation.",
  yoga: "Dynamic, flowing yoga stimulates your stable Kapha energy, helping you feel lighter and more energized.",
  music: "Upbeat, energizing music activates your slow Kapha nature, lifting heaviness and inspiring movement.",
  food: "Light, spicy foods stimulate your heavy Kapha constitution, boosting metabolism and energy.",
  exercise: "Vigorous exercise breaks through Kapha stagnation, bringing warmth, energy, and mental clarity.",
  sunlight: "Morning sunlight exposure energizes your cool Kapha nature, dispelling sluggishness and depression.",
  default: "This practice helps stimulate your Kapha energy, bringing movement and vitality to ease your current state."
};

/**
 * Get dosha-specific template based on content type
 */
const getDoshaTemplate = (dosha: string, contentType: string): string => {
  const normalizedDosha = dosha.toLowerCase();
  const normalizedType = contentType.toLowerCase();
  
  let templates: Record<string, string>;
  
  switch (normalizedDosha) {
    case 'vata':
      templates = VATA_TEMPLATES;
      break;
    case 'pitta':
      templates = PITTA_TEMPLATES;
      break;
    case 'kapha':
      templates = KAPHA_TEMPLATES;
      break;
    default:
      templates = VATA_TEMPLATES; // Default to Vata if unknown
  }
  
  // Try to match content type to template key
  for (const key in templates) {
    if (normalizedType.includes(key)) {
      return templates[key];
    }
  }
  
  // Return default template for the dosha
  return templates.default;
};

/**
 * Build emotion-aware explanation
 */
const buildEmotionContext = (emotion: string): string => {
  const emotionMap: Record<string, string> = {
    anxious: "your anxiety",
    stressed: "your stress",
    sad: "your sadness",
    angry: "your anger",
    frustrated: "your frustration",
    worried: "your worry",
    overwhelmed: "feeling overwhelmed",
    tired: "your fatigue",
    restless: "your restlessness",
    irritated: "your irritation",
    depressed: "your low mood",
    fearful: "your fear",
    neutral: "your current state",
    calm: "maintaining your calm",
    happy: "enhancing your wellbeing"
  };
  
  return emotionMap[emotion.toLowerCase()] || "your current emotional state";
};

// ── BUILD RECOMMENDATIONS  
export const buildRecommendations = (
  knowledge: KnowledgeRow[],
  emotion: string,
  dominantDosha: string
): RecommendationItem[] => {
  return knowledge.slice(0, 3).map((k) => {
    // Get dosha-specific template
    const doshaExplanation = getDoshaTemplate(dominantDosha, k.content_type);
    
    // Build emotion context
    const emotionContext = buildEmotionContext(emotion);
    
    // Combine into a personalized "why" message
    const why = `${doshaExplanation} This is especially helpful for ${emotionContext}.`;
    
    return {
      knowledge_id: k.knowledge_id,
      title: k.title,
      content_type: k.content_type,
      duration_minutes: k.duration_minutes,
      why,
    };
  });
};

// ── PERSIST 
export const saveRecommendations = async (
  userId: string,
  sessionId: string,
  items: RecommendationItem[],
  emotion: string,
  dosha: string
): Promise<void> => {
  for (const item of items) {
    await pool.query(
      `INSERT INTO recommendation_history
         (user_id, session_id, knowledge_id, reason, priority, ai_explanation)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        sessionId,
        item.knowledge_id,
        JSON.stringify({ emotion, dosha }),
        "medium",
        item.why,
      ]
    );
    // bump the counter on the knowledge row
    await incrementRecommendCount(item.knowledge_id);
  }
};