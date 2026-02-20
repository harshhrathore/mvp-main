// Reads every env var the app needs.
// Call ensureEnv() once at boot; it throws immediately if anything critical is missing.

const REQUIRED = [
  "DATABASE_URL",
  "JWT_SECRET",
] as const;

const OPTIONAL = [
  "PORT",
  "NODE_ENV",
  "ALLOWED_ORIGINS",
  "JWT_EXPIRES_IN",
  
  // Python Dosha Service
  "DOSHA_SERVICE_URL",
  "DOSHA_SERVICE_TIMEOUT",
  
  // AI / LLM
  "AI_SERVICE_TYPE",
  "OLLAMA_BASE_URL",
  "OLLAMA_MODEL",
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  
  // Speech Services
  "STT_SERVICE",
  "TTS_SERVICE",
  "OPENAI_WHISPER_API_KEY",
  "ELEVENLABS_API_KEY",
  "ELEVENLABS_VOICE_ID",
  "GOOGLE_APPLICATION_CREDENTIALS",
  
  // Emotion Analysis
  "EMOTION_SERVICE",
  "BERT_API_URL",
  "BERT_API_KEY",
  
  // Storage
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  
  // Monitoring
  "SENTRY_DSN",
  
  // Rate Limiting
  "RATE_LIMIT_WINDOW_MS",
  "RATE_LIMIT_MAX_REQUESTS",
  
  // Feature Flags
  "ENABLE_EMAIL_VERIFICATION",
  "ENABLE_CRISIS_DETECTION",
  "ENABLE_RECOMMENDATIONS",
] as const;

export function ensureEnv(): void {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(
      `[env] Missing required environment variables: ${missing.join(", ")}\n` +
      `Copy .env.example → .env and fill in the values.`
    );
  }
}

// Typed accessors — keeps the rest of the code clean
export const env = {
  // Server
  port:              () => Number(process.env.PORT || 5000),
  nodeEnv:           () => process.env.NODE_ENV || "development",
  allowedOrigins:    () => process.env.ALLOWED_ORIGINS || "",
  
  // Database
  databaseUrl:       () => process.env.DATABASE_URL!,
  
  // Auth
  jwtSecret:         () => process.env.JWT_SECRET!,
  jwtExpiresIn:      () => process.env.JWT_EXPIRES_IN || "7d",
  
  // Python Dosha Service
  doshaServiceUrl:   () => process.env.DOSHA_SERVICE_URL || "http://localhost:8000",
  doshaServiceTimeout: () => Number(process.env.DOSHA_SERVICE_TIMEOUT || 10000),
  
  // AI / LLM
  aiServiceType:     () => process.env.AI_SERVICE_TYPE || "ollama",
  ollamaBaseUrl:     () => process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  ollamaModel:       () => process.env.OLLAMA_MODEL || "llama2",
  openaiKey:         () => process.env.OPENAI_API_KEY || "",
  openaiModel:       () => process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
  
  // Speech Services
  sttService:        () => process.env.STT_SERVICE || "mock",
  ttsService:        () => process.env.TTS_SERVICE || "mock",
  openaiWhisperKey:  () => process.env.OPENAI_WHISPER_API_KEY || "",
  elevenlabsKey:     () => process.env.ELEVENLABS_API_KEY || "",
  elevenlabsVoice:   () => process.env.ELEVENLABS_VOICE_ID || "",
  googleCredentials: () => process.env.GOOGLE_APPLICATION_CREDENTIALS || "",
  
  // Emotion Analysis
  emotionService:    () => process.env.EMOTION_SERVICE || "mock",
  bertUrl:           () => process.env.BERT_API_URL || "",
  bertKey:           () => process.env.BERT_API_KEY || "",
  
  // Storage
  cloudinaryCloud:   () => process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryKey:     () => process.env.CLOUDINARY_API_KEY || "",
  cloudinarySecret:  () => process.env.CLOUDINARY_API_SECRET || "",
  
  // Monitoring
  sentryDsn:         () => process.env.SENTRY_DSN || "",
  
  // Rate Limiting
  rateLimitWindow:   () => Number(process.env.RATE_LIMIT_WINDOW_MS || 900000),
  rateLimitMax:      () => Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  
  // Feature Flags
  enableEmailVerification: () => process.env.ENABLE_EMAIL_VERIFICATION === "true",
  enableCrisisDetection:   () => process.env.ENABLE_CRISIS_DETECTION !== "false",
  enableRecommendations:   () => process.env.ENABLE_RECOMMENDATIONS !== "false",
};