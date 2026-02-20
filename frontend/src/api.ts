import axios from "axios";
import { parseError, isAuthError } from "./utils/errorHandler";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Parse error for better handling
    const apiError = parseError(error);

    // Handle authentication errors
    if (isAuthError(error)) {
      // Only redirect if not already on auth pages
      const currentPath = window.location.pathname;
      if (
        !currentPath.includes("/login") &&
        !currentPath.includes("/register")
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    // Log errors in development
    if (import.meta.env.DEV) {
      console.error("API Error:", apiError);
    }

    return Promise.reject(error);
  },
);

// Helper types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string>;
}

// Auth types
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  gender?: string;
  birth_date?: string;
  country?: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Dosha types
export interface DoshaProfile {
  primary_dosha: string;
  secondary_dosha?: string;
  prakriti_scores: {
    vata: number;
    pitta: number;
    kapha: number;
  };
  confidence_score: number;
}

// Chat types
export interface ChatResponse {
  ai_reply: string;
  session_id: string;
  message_id: string;
  emotion: {
    primary: string;
    intensity: number;
  };
  is_crisis: boolean;
  recommendations?: Array<{
    knowledge_id: string;
    title: string;
    content_type: string;
  }>;
}

// Progress types
export interface DailyProgress {
  progress_id: string;
  date: string;
  avg_emotion_score: number;
  primary_emotion_day: string;
  conversations_count: number;
  practices_completed: number;
  sleep_quality?: number;
  energy_levels?: number;
  stress_level?: number;
}

export interface Streak {
  current: number;
  longest: number;
}

export default api;
