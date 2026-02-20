/**
 * Chat API Client
 * Handles text and voice chat communication with the backend
 */

import { api } from "../api";

// Custom error class for API errors
export class ChatAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public isNetworkError: boolean = false,
    public isAuthError: boolean = false,
  ) {
    super(message);
    this.name = "ChatAPIError";
  }
}

// Request/Response Interfaces
export interface ChatMessage {
  message: string;
  inputType: "text" | "voice";
  audioUrl?: string;
}

export interface ChatResponse {
  success: boolean;
  data: {
    reply: string;
    emotion: {
      primary: string;
      intensity: number;
    };
    recommendations: Recommendation[];
    is_crisis: boolean;
    crisis_level: string;
    meta: {
      session_id: string;
      message_id: string;
    };
  };
}

export interface VoiceMessage {
  audio: string; // base64
}

export interface VoiceResponse {
  success: boolean;
  data: {
    transcript: string;
    transcript_confidence: number;
    reply_text: string;
    reply_audio_url: string | null;
    emotion: {
      primary: string;
      intensity: number;
    };
    recommendations: Recommendation[];
    is_crisis: boolean;
    crisis_level?: string;
    meta: {
      session_id: string;
      message_id: string;
    };
  };
}

export interface Recommendation {
  knowledge_id: string;
  title: string;
  content_type: string;
  duration_minutes: number | null;
  why: string;
}

export interface Session {
  session_id: string;
  started_at: string;
  type: string;
}

// Session storage key
const SESSION_STORAGE_KEY = "sama_chat_session_id";

/**
 * ChatAPIClient class
 * Manages chat API communication and session persistence
 */
export class ChatAPIClient {
  private baseURL: string;
  private getAuthToken: () => string | null;

  constructor(baseURL: string, getAuthToken: () => string | null) {
    this.baseURL = baseURL;
    this.getAuthToken = getAuthToken;
  }

  /**
   * Send a text message to the chat API
   * @param message - The text message to send
   * @param sessionId - Optional session ID to continue a conversation
   * @returns ChatResponse with AI reply and metadata
   * @throws ChatAPIError with specific error details
   */
  async sendTextMessage(
    message: string,
    sessionId?: string,
  ): Promise<ChatResponse> {
    try {
      const token = this.getAuthToken();

      const requestBody: any = {
        message,
        inputType: "text",
      };

      // Include session_id if provided or retrieve from storage
      const activeSessionId = sessionId || this.getStoredSessionId();
      if (activeSessionId) {
        requestBody.session_id = activeSessionId;
      }

      const response = await api.post<ChatResponse>(
        "/api/chat/message",
        requestBody,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );

      // Store session_id after first message
      if (response.data.data?.meta?.session_id) {
        this.storeSessionId(response.data.data.meta.session_id);
      }

      return response.data;
    } catch (error: any) {
      // Handle network errors
      if (!error.response) {
        throw new ChatAPIError(
          "Connection lost. Please check your internet connection.",
          undefined,
          true,
          false,
        );
      }

      // Handle authentication errors (401)
      if (error.response?.status === 401) {
        throw new ChatAPIError(
          "Your session has expired. Please log in again.",
          401,
          false,
          true,
        );
      }

      // Handle specific backend error messages
      const backendMessage =
        error.response?.data?.message || error.response?.data?.error;

      // If session not found error, clear the stored session and retry without it
      if (
        backendMessage &&
        backendMessage.toLowerCase().includes("session") &&
        backendMessage.toLowerCase().includes("not found")
      ) {
        console.warn(
          "Invalid session detected, clearing stored session:",
          this.getStoredSessionId(),
        );
        this.clearSessionId();

        // Retry the request without session_id
        try {
          const retryToken = this.getAuthToken();
          const retryRequestBody: any = {
            message,
            inputType: "text",
          };

          const retryResponse = await api.post<ChatResponse>(
            "/api/chat/message",
            retryRequestBody,
            {
              headers: {
                Authorization: retryToken ? `Bearer ${retryToken}` : "",
              },
            },
          );

          // Store new session_id
          if (retryResponse.data.data?.meta?.session_id) {
            this.storeSessionId(retryResponse.data.data.meta.session_id);
          }

          return retryResponse.data;
        } catch (retryError: any) {
          // If retry also fails, throw the original error
          throw new ChatAPIError(
            backendMessage,
            error.response?.status,
            false,
            false,
          );
        }
      }

      if (backendMessage) {
        throw new ChatAPIError(
          backendMessage,
          error.response?.status,
          false,
          false,
        );
      }

      // Generic error fallback
      throw new ChatAPIError(
        "Something went wrong. Please try again.",
        error.response?.status,
        false,
        false,
      );
    }
  }

  /**
   * Send a voice message to the chat API
   * @param audioBase64 - Base64 encoded audio data
   * @param sessionId - Optional session ID to continue a conversation
   * @returns VoiceResponse with transcript, AI reply, and audio URL
   * @throws ChatAPIError with specific error details
   */
  async sendVoiceMessage(
    audioBase64: string,
    sessionId?: string,
  ): Promise<VoiceResponse> {
    try {
      const token = this.getAuthToken();

      const requestBody: any = {
        audio: audioBase64,
      };

      // Include session_id if provided or retrieve from storage
      const activeSessionId = sessionId || this.getStoredSessionId();
      if (activeSessionId) {
        requestBody.session_id = activeSessionId;
      }

      const response = await api.post<VoiceResponse>(
        "/api/voice/chat",
        requestBody,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );

      // Store session_id after first message
      if (response.data.data?.meta?.session_id) {
        this.storeSessionId(response.data.data.meta.session_id);
      }

      return response.data;
    } catch (error: any) {
      // Handle network errors
      if (!error.response) {
        throw new ChatAPIError(
          "Connection lost. Please check your internet connection.",
          undefined,
          true,
          false,
        );
      }

      // Handle authentication errors (401)
      if (error.response?.status === 401) {
        throw new ChatAPIError(
          "Your session has expired. Please log in again.",
          401,
          false,
          true,
        );
      }

      // Handle specific backend error messages
      const backendMessage =
        error.response?.data?.message || error.response?.data?.error;
      if (backendMessage) {
        throw new ChatAPIError(
          backendMessage,
          error.response?.status,
          false,
          false,
        );
      }

      // Generic error fallback
      throw new ChatAPIError(
        "Something went wrong with voice processing. Please try again.",
        error.response?.status,
        false,
        false,
      );
    }
  }

  /**
   * Get the current session information
   * @returns Session object or null if no active session
   */
  async getSession(): Promise<Session | null> {
    const sessionId = this.getStoredSessionId();
    if (!sessionId) {
      return null;
    }

    try {
      const token = this.getAuthToken();
      const response = await api.get<{ success: boolean; data: Session }>(
        `/api/chat/session/${sessionId}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );

      return response.data.data;
    } catch (error) {
      // If session not found or error, clear stored session
      this.clearSessionId();
      return null;
    }
  }

  /**
   * End the current session
   */
  async endSession(): Promise<void> {
    const sessionId = this.getStoredSessionId();
    if (!sessionId) {
      return;
    }

    try {
      const token = this.getAuthToken();
      await api.post(
        `/api/chat/session/${sessionId}/end`,
        {},
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        },
      );
    } finally {
      // Always clear local session regardless of API result
      this.clearSessionId();
    }
  }

  /**
   * Store session ID in local storage
   * @param sessionId - The session ID to store
   */
  private storeSessionId(sessionId: string): void {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    } catch (error) {
      console.error("Failed to store session ID:", error);
    }
  }

  /**
   * Retrieve session ID from local storage
   * @returns The stored session ID or null
   */
  private getStoredSessionId(): string | null {
    try {
      return localStorage.getItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to retrieve session ID:", error);
      return null;
    }
  }

  /**
   * Clear session ID from local storage
   */
  private clearSessionId(): void {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear session ID:", error);
    }
  }

  /**
   * Get the current session ID from storage
   * @returns The stored session ID or null
   */
  getSessionId(): string | null {
    return this.getStoredSessionId();
  }
}

/**
 * Create a default ChatAPIClient instance
 */
export function createChatAPIClient(): ChatAPIClient {
  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const getAuthToken = () => localStorage.getItem("token");

  return new ChatAPIClient(baseURL, getAuthToken);
}

// Export a default instance
export const chatAPIClient = createChatAPIClient();
