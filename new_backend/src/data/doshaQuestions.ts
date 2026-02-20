/**
 * Dosha Assessment Questions
 * 15 questions across 3 tiers (physical, physiological, behavioral)
 * Tier weights: Physical 50%, Physiological 30%, Behavioral 20%
 */

export interface DoshaOption {
  option_text: string;
  dosha: 'vata' | 'pitta' | 'kapha';
  weight: number;
}

export interface DoshaQuestion {
  question_id: number;
  question_text: string;
  tier: 'physical' | 'physiological' | 'behavioral';
  options: DoshaOption[];
}

export const DOSHA_QUESTIONS: DoshaQuestion[] = [
  // ═══════════════════════════════════════════════════════
  // PHYSICAL TIER (Questions 1-8) - 50% weight
  // ═══════════════════════════════════════════════════════
  {
    question_id: 1,
    question_text: 'How would you describe your body frame?',
    tier: 'physical',
    options: [
      { option_text: 'Thin, light, hard to gain weight', dosha: 'vata', weight: 1.0 },
      { option_text: 'Medium build, athletic, well-proportioned', dosha: 'pitta', weight: 1.0 },
      { option_text: 'Large, solid, heavy, easy to gain weight', dosha: 'kapha', weight: 1.0 },
    ],
  },
  {
    question_id: 2,
    question_text: 'What is your natural skin type?',
    tier: 'physical',
    options: [
      { option_text: 'Dry, rough, thin, cool to touch', dosha: 'vata', weight: 1.0 },
      { option_text: 'Warm, oily, prone to redness or rashes', dosha: 'pitta', weight: 1.0 },
      { option_text: 'Thick, moist, smooth, cool, pale', dosha: 'kapha', weight: 1.0 },
    ],
  },
  {
    question_id: 3,
    question_text: 'How is your hair naturally?',
    tier: 'physical',
    options: [
      { option_text: 'Dry, brittle, frizzy, thin', dosha: 'vata', weight: 1.0 },
      { option_text: 'Straight, oily, fine, early graying or balding', dosha: 'pitta', weight: 1.0 },
      { option_text: 'Thick, lustrous, wavy, oily', dosha: 'kapha', weight: 1.0 },
    ],
  },
  {
    question_id: 4,
    question_text: 'What are your eyes like?',
    tier: 'physical',
    options: [
      { option_text: 'Small, dry, active, nervous', dosha: 'vata', weight: 1.0 },
      { option_text: 'Sharp, penetrating, light-sensitive', dosha: 'pitta', weight: 1.0 },
      { option_text: 'Large, calm, moist, attractive', dosha: 'kapha', weight: 1.0 },
    ],
  },
  {
    question_id: 5,
    question_text: 'How would you describe your hands?',
    tier: 'physical',
    options: [
      { option_text: 'Small, thin, dry, cold, rough', dosha: 'vata', weight: 1.0 },
      { option_text: 'Medium, warm, pink, moist', dosha: 'pitta', weight: 1.0 },
      { option_text: 'Large, thick, firm, cool, smooth', dosha: 'kapha', weight: 1.0 },
    ],
  },
  {
    question_id: 6,
    question_text: 'What is your natural body temperature?',
    tier: 'physical',
    options: [
      { option_text: 'Cold hands and feet, prefer warmth', dosha: 'vata', weight: 1.0 },
      { option_text: 'Warm body, prefer cool environments', dosha: 'pitta', weight: 1.0 },
      { option_text: 'Cool but comfortable, adapt easily', dosha: 'kapha', weight: 1.0 },
    ],
  },
  {
    question_id: 7,
    question_text: 'How would you describe your joints?',
    tier: 'physical',
    options: [
      { option_text: 'Small, prominent, crack often, flexible', dosha: 'vata', weight: 1.0 },
      { option_text: 'Medium, loose, flexible', dosha: 'pitta', weight: 1.0 },
      { option_text: 'Large, well-formed, padded, stable', dosha: 'kapha', weight: 1.0 },
    ],
  },
  {
    question_id: 8,
    question_text: 'What is your natural physical strength and stamina?',
    tier: 'physical',
    options: [
      { option_text: 'Low endurance, tire easily, energy comes in bursts', dosha: 'vata', weight: 1.0 },
      { option_text: 'Medium strength, focused intensity', dosha: 'pitta', weight: 1.0 },
      { option_text: 'Strong, excellent endurance, slow and steady', dosha: 'kapha', weight: 1.0 },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // PHYSIOLOGICAL TIER (Questions 9-12) - 30% weight
  // ═══════════════════════════════════════════════════════
  {
    question_id: 9,
    question_text: 'How is your digestion and appetite?',
    tier: 'physiological',
    options: [
      { option_text: 'Variable, irregular, sometimes skip meals', dosha: 'vata', weight: 1.0 },
      { option_text: 'Strong, sharp, can\'t skip meals, get irritable when hungry', dosha: 'pitta', weight: 1.0 },
      { option_text: 'Slow, steady, can skip meals easily', dosha: 'kapha', weight: 1.0 },
    ],
  },
  {
    question_id: 10,
    question_text: 'What are your bowel movements like?',
    tier: 'physiological',
    options: [
      { option_text: 'Irregular, dry, constipation-prone', dosha: 'vata', weight: 1.0 },
      { option_text: 'Regular, loose, multiple times daily', dosha: 'pitta', weight: 1.0 },
      { option_text: 'Heavy, slow, once daily or less', dosha: 'kapha', weight: 1.0 },
    ],
  },
  {
    question_id: 11,
    question_text: 'How is your sleep pattern?',
    tier: 'physiological',
    options: [
      { option_text: 'Light, interrupted, difficulty falling asleep', dosha: 'vata', weight: 1.0 },
      { option_text: 'Sound, moderate, wake up easily', dosha: 'pitta', weight: 1.0 },
      { option_text: 'Deep, heavy, need 8+ hours, hard to wake up', dosha: 'kapha', weight: 1.0 },
    ],
  },
  {
    question_id: 12,
    question_text: 'How do you typically sweat?',
    tier: 'physiological',
    options: [
      { option_text: 'Minimal, even during exercise', dosha: 'vata', weight: 1.0 },
      { option_text: 'Profuse, especially when hot or exercising', dosha: 'pitta', weight: 1.0 },
      { option_text: 'Moderate, steady, pleasant odor', dosha: 'kapha', weight: 1.0 },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // BEHAVIORAL TIER (Questions 13-15) - 20% weight
  // ═══════════════════════════════════════════════════════
  {
    question_id: 13,
    question_text: 'How would you describe your mental activity and speech?',
    tier: 'behavioral',
    options: [
      { option_text: 'Quick mind, restless, talk fast and a lot', dosha: 'vata', weight: 1.0 },
      { option_text: 'Sharp intellect, focused, precise speech', dosha: 'pitta', weight: 1.0 },
      { option_text: 'Calm, steady thoughts, slow deliberate speech', dosha: 'kapha', weight: 1.0 },
    ],
  },
  {
    question_id: 14,
    question_text: 'How do you typically respond to stress?',
    tier: 'behavioral',
    options: [
      { option_text: 'Anxious, worried, fearful, overwhelmed', dosha: 'vata', weight: 1.0 },
      { option_text: 'Irritable, angry, frustrated, aggressive', dosha: 'pitta', weight: 1.0 },
      { option_text: 'Withdrawn, depressed, avoid confrontation', dosha: 'kapha', weight: 1.0 },
    ],
  },
  {
    question_id: 15,
    question_text: 'How is your memory and learning style?',
    tier: 'behavioral',
    options: [
      { option_text: 'Learn quickly but forget quickly, short-term memory', dosha: 'vata', weight: 1.0 },
      { option_text: 'Sharp memory, learn with focus, medium retention', dosha: 'pitta', weight: 1.0 },
      { option_text: 'Learn slowly but never forget, excellent long-term memory', dosha: 'kapha', weight: 1.0 },
    ],
  },
];

// Version for tracking question changes
export const QUESTIONS_VERSION = '1.0.0';

// Helper function to get questions
export const getDoshaQuestions = (): { questions: DoshaQuestion[]; version: string } => {
  return {
    questions: DOSHA_QUESTIONS,
    version: QUESTIONS_VERSION,
  };
};
