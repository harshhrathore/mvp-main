// ── Auth 
export interface UserRow {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  birth_date: string | null;
  gender: string | null;
  country: string;
  account_status: string;
  created_at: string;
  updated_at: string;
}

export interface AuthRow {
  auth_id: string;
  user_id: string;
  password_hash: string | null;
  google_id: string | null;
  apple_id: string | null;
  last_login_at: string | null;
  failed_attempts: number;
  locked_until: string | null;
}

// ── Onboarding 
export interface OnboardingRow {
  onboarding_id: string;
  user_id: string;
  step_1_done: boolean;
  step_2_done: boolean;
  step_3_done: boolean;
  health_baseline: HealthBaseline | null;
  created_at: string;
}

export interface HealthBaseline {
  sleep: number;       // 1-10
  energy: number;      // 1-10
  appetite: number;    // 1-10
  pain: number;        // 1-10
  medications: string[];
}

// ── Dosha 
export interface DoshaScores {
  vata: number;
  pitta: number;
  kapha: number;
  [key: string]: number;
}

export interface AssessmentRow {
  assessment_id: string;
  user_id: string;
  assessment_type: string;
  responses: QuizAnswer[];
  prakriti_scores: DoshaScores;
  primary_dosha: string;
  secondary_dosha: string | null;
  confidence_score: number;
  algorithm_version: string;
  completed_at: string;
}

export interface QuizAnswer {
  question_id: string;
  tier: "physical" | "physiological" | "behavioral";
  selected_dosha: "Vata" | "Pitta" | "Kapha";
  weight: number;       // 1-5
}

export interface DoshaTrackingRow {
  tracking_id: string;
  user_id: string;
  date: string;
  vikriti_scores: DoshaScores;
  dominant_imbalance: string;
  imbalance_intensity: number;
  detected_emotion: string | null;
  created_at: string;
}

// ── Conversation 
export interface SessionRow {
  session_id: string;
  user_id: string;
  session_type: string;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
}

export interface MessageRow {
  message_id: string;
  session_id: string;
  user_id: string;
  sequence_number: number;
  input_type: "voice" | "text";
  audio_file_url: string | null;
  transcript_text: string | null;
  transcript_confidence: number | null;
  ai_response_text: string | null;
  ai_response_audio_url: string | null;
  response_emotion_tone: string | null;
  time_of_day: string | null;
  detected_context: string | null;
  created_at: string;
}

// ── Emotion 
export interface EmotionResult {
  primary_emotion: string;
  primary_confidence: number;   // 0-1
  all_emotions: Record<string, number>;
  emotion_intensity: number;    // 1-10
}

export interface EmotionRow {
  analysis_id: string;
  message_id: string;
  user_id: string;
  primary_emotion: string;
  primary_confidence: number;
  all_emotions: Record<string, number>;
  emotion_intensity: number;
  vata_impact: number;
  pitta_impact: number;
  kapha_impact: number;
  recommended_dosha_focus: string;
  bert_model_version: string;
  processing_time_ms: number;
  created_at: string;
}

// ── Knowledge 
export interface KnowledgeRow {
  knowledge_id: string;
  content_type: string;
  title: string;
  description_short: string | null;
  description_detailed: string | null;
  balances_doshas: string[];
  aggravates_doshas: string[];
  best_for_season: string | null;
  best_time_of_day: string | null;
  helps_with_emotions: string[];
  duration_minutes: number | null;
  difficulty: string | null;
  steps: Array<{ step: number; instruction: string }> | null;
  precautions: string[];
  video_url: string | null;
  traditional_source: string | null;
  user_success_rate: number;
  times_recommended: number;
  avg_effectiveness: number;
  created_at: string;
}

// ── Safety 
export interface SafetyCheckResult {
  is_crisis: boolean;
  crisis_level: "low" | "medium" | "high" | "critical";
  detected_keywords: string[];
  confidence: number;
}

export interface HelplineInfo {
  name: string;
  number: string;
  hours: string;
  languages: string[];
}

// ── Recommendation 
export interface RecommendationRow {
  recommendation_id: string;
  user_id: string;
  session_id: string | null;
  knowledge_id: string | null;
  reason: Record<string, string>;
  priority: string;
  ai_explanation: string | null;
  user_accepted: boolean;
  completed: boolean;
  effectiveness_rating: number | null;
  recommended_at: string;
}

// ── Streak
export interface StreakRow {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
}

// API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}