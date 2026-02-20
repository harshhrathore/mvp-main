import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import wellnessBg from "../assets/wellness-pattern.png";
import micIcon from "../assets/mic-icon.png"; // We will replace usage but keep import if needed or remove later
import { chatAPIClient, ChatAPIError } from "../api/chatClient";
import type { Recommendation } from "../api/chatClient";
import EmotionBadge from "../components/wellness/EmotionBadge";
import RecommendationCard from "../components/wellness/RecommendationCard";
import CrisisHelpline from "../components/wellness/CrisisHelpline";
import VoiceRecorder from "../components/wellness/VoiceRecorder";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";
import { Menu, X, Mic, Volume2 } from "lucide-react";

const Typewriter = ({
  text,
  onComplete,
}: {
  text: string;
  onComplete?: () => void;
}) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let index = 0;
    // Faster typing for simulated feel similar to streaming
    const interval = setInterval(() => {
      setDisplayed((prev) => {
        if (index >= text.length) {
          clearInterval(interval);
          if (onComplete) onComplete();
          return text;
        }
        const next = text.slice(0, index + 1);
        index++;
        return next;
      });
    }, 15); // Used to be 10, slightly adjusted
    return () => clearInterval(interval);
  }, [text, onComplete]);

  return <>{displayed}</>;
};

type WellnessRole = "user" | "assistant";

type WellnessMessage = {
  id: string;
  role: WellnessRole;
  content: string;
  createdAt: number;
  emotion?: {
    primary: string;
    intensity: number;
  };
  recommendations?: Recommendation[];
  isCrisis?: boolean;
  crisisLevel?: string;
  audioUrl?: string; // Backend audio (optional usage)
  isVoice?: boolean;
};

type WellnessThread = {
  id: string;
  title: string;
  createdAt: number;
  messages: WellnessMessage[];
};

const STORAGE_KEY = "samaa:todaysWellness:threads";

const makeId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const formatTime = (ts: number) => {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "";
  }
};

const TodaysWellness: React.FC = () => {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Voice & Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isRecordingMode, setIsRecordingMode] = useState(false);

  const [threads, setThreads] = useState<WellnessThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);

  const MAX_MESSAGE_LENGTH = 2000;

  const voiceAreaRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Responsive check
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && !isSidebarOpen) setIsSidebarOpen(true); // Auto-open on desktop if closed
      if (mobile && isSidebarOpen) setIsSidebarOpen(false); // Auto-close on mobile
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen]);

  // Voice recording hook
  const {
    isRecording,
    duration,
    error: voiceError,
    startRecording,
    stopRecording,
    resetError,
  } = useVoiceRecorder(120); // 2 minutes max

  const activeThread = threads.find((t) => t.id === activeThreadId) ?? null;

  const startNewThread = (): WellnessThread => {
    const now = Date.now();
    const newThread: WellnessThread = {
      id: makeId(),
      title: "New chat",
      createdAt: now,
      messages: [],
    };
    setThreads((prev) => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
    setInputText("");
    return newThread;
  };

  const sendMessage = async () => {
    const trimmed = inputText.trim();

    // Validate message is not empty
    if (!trimmed) {
      setValidationError("Please enter a message");
      return;
    }

    // Validate message length
    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      setValidationError(
        `Message is too long. Maximum ${MAX_MESSAGE_LENGTH} characters allowed.`,
      );
      return;
    }

    if (isLoading) return;

    // Clear validation error if validation passes
    setValidationError(null);

    let threadId = activeThreadId;
    if (!threadId) {
      const newThread = startNewThread();
      threadId = newThread.id;
    }

    const now = Date.now();
    const userMessage: WellnessMessage = {
      id: makeId(),
      role: "user",
      content: trimmed,
      createdAt: now,
    };

    // Add user message to UI immediately
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        const nextTitle =
          t.title === "New chat"
            ? trimmed.length > 36
              ? `${trimmed.slice(0, 36)}…`
              : trimmed
            : t.title;
        return {
          ...t,
          title: nextTitle,
          messages: [...t.messages, userMessage],
        };
      }),
    );
    // setInputText(""); // Removed: only clear on success
    setIsLoading(true);
    setErrorMessage(null); // Clear any previous errors

    try {
      // Call backend API
      const response = await chatAPIClient.sendTextMessage(trimmed);

      if (response.success && response.data) {
        const { reply, emotion, recommendations, is_crisis, crisis_level } =
          response.data;

        // Create AI response message
        const aiMessage: WellnessMessage = {
          id: makeId(),
          role: "assistant",
          content: reply,
          createdAt: Date.now(),
          emotion: emotion,
          recommendations: recommendations,
          isCrisis: is_crisis,
          crisisLevel: crisis_level,
        };

        // Add AI response to UI
        setThreads((prev) =>
          prev.map((t) => {
            if (t.id !== threadId) return t;
            return { ...t, messages: [...t.messages, aiMessage] };
          }),
        );
        setInputText(""); // Clear input on success
      }
    } catch (error) {
      console.error("Failed to send message:", error);

      // Handle ChatAPIError with specific error handling
      if (error instanceof ChatAPIError) {
        // Handle authentication errors - redirect to login
        if (error.isAuthError) {
          setErrorMessage(error.message);
          // Clear auth token and redirect to login after a brief delay
          localStorage.removeItem("token");
          setTimeout(() => {
            navigate("/login", { state: { returnUrl: "/todays-wellness" } });
          }, 1500);
          return;
        }

        // Display the specific error message
        setErrorMessage(error.message);
      } else {
        // Fallback for unknown errors
        setErrorMessage("Something went wrong. Please try again.");
      }

      // Add error message to UI
      const errorMsg: WellnessMessage = {
        id: makeId(),
        role: "assistant",
        content:
          error instanceof ChatAPIError
            ? error.message
            : "I'm having trouble connecting right now. Please try again.",
        createdAt: Date.now(),
      };
      setThreads((prev) =>
        prev.map((t) => {
          if (t.id !== threadId) return t;
          return { ...t, messages: [...t.messages, errorMsg] };
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      resetError();
      await startRecording();
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const handleStopRecording = async () => {
    try {
      const result = await stopRecording();
      if (!result) {
        return;
      }

      const threadId = activeThreadId;
      if (!threadId) {
        startNewThread();
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);
      setIsRecordingMode(false);

      // Send voice message to backend
      try {
        const response = await chatAPIClient.sendVoiceMessage(result.audioData);

        if (response.success && response.data) {
          const {
            transcript,
            reply_text,
            reply_audio_url,
            emotion,
            recommendations,
            is_crisis,
            crisis_level,
          } = response.data;

          // Add user message (transcript) to UI
          const userMessage: WellnessMessage = {
            id: makeId(),
            role: "user",
            content: transcript,
            createdAt: Date.now(),
            isVoice: true,
          };

          setThreads((prev) =>
            prev.map((t) => {
              if (t.id !== threadId) return t;
              const nextTitle =
                t.title === "New chat"
                  ? transcript.length > 36
                    ? `${transcript.slice(0, 36)}…`
                    : transcript
                  : t.title;
              return {
                ...t,
                title: nextTitle,
                messages: [...t.messages, userMessage],
              };
            }),
          );

          // Add AI response to UI
          const aiMessage: WellnessMessage = {
            id: makeId(),
            role: "assistant",
            content: reply_text,
            createdAt: Date.now(),
            emotion: emotion,
            recommendations: recommendations,
            isCrisis: is_crisis,
            crisisLevel: crisis_level,
            audioUrl: reply_audio_url || undefined,
            isVoice: true,
          };

          setThreads((prev) =>
            prev.map((t) => {
              if (t.id !== threadId) return t;
              return { ...t, messages: [...t.messages, aiMessage] };
            }),
          );
        }
      } catch (error) {
        console.error("Failed to send voice message:", error);

        // Handle ChatAPIError with specific error handling
        if (error instanceof ChatAPIError) {
          // Handle authentication errors - redirect to login
          if (error.isAuthError) {
            setErrorMessage(error.message);
            localStorage.removeItem("token");
            setTimeout(() => {
              navigate("/login", { state: { returnUrl: "/todays-wellness" } });
            }, 1500);
            return;
          }

          setErrorMessage(error.message);
        } else {
          setErrorMessage("Failed to process voice message. Please try again.");
        }

        // Add error message to UI
        const errorMsg: WellnessMessage = {
          id: makeId(),
          role: "assistant",
          content:
            error instanceof ChatAPIError
              ? error.message
              : "I'm having trouble processing your voice message. Please try again.",
          createdAt: Date.now(),
        };
        setThreads((prev) =>
          prev.map((t) => {
            if (t.id !== threadId) return t;
            return { ...t, messages: [...t.messages, errorMsg] };
          }),
        );
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to stop recording:", error);
      setIsRecordingMode(false);
    }
  };

  const handleCancelRecording = () => {
    setIsRecordingMode(false);
    resetError();
  };

  const playAudio = (audioUrl: string) => {
    try {
      setAudioError(null);
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().catch((error) => {
          console.error("Failed to play audio:", error);
          setAudioError("Failed to play audio. Please try again.");
        });
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      setAudioError("Audio playback error.");
    }
  };

  // Auto-play audio when new voice message with audio arrives
  useEffect(() => {
    if (!activeThread) return;

    const lastMessage = activeThread.messages[activeThread.messages.length - 1];
    if (
      lastMessage &&
      lastMessage.role === "assistant" &&
      lastMessage.audioUrl &&
      lastMessage.isVoice
    ) {
      // Auto-play the audio response
      playAudio(lastMessage.audioUrl);
    }
  }, [activeThread?.messages.length]);

  useEffect(() => {
    const loadSessionHistory = async () => {
      try {
        const sessionId = chatAPIClient.getSessionId();
        if (sessionId) {
          // Session exists, try to load history from backend
          const session = await chatAPIClient.getSession();
          if (session) {
            // Session is valid, we could load message history here
            // For now, we'll rely on local storage for history
            console.log("Active session found:", session.session_id);
          }
        }
      } catch (error) {
        console.error("Failed to load session:", error);
      }
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const now = Date.now();
        const initial: WellnessThread = {
          id: makeId(),
          title: "New chat",
          createdAt: now,
          messages: [],
        };
        setThreads([initial]);
        setActiveThreadId(initial.id);
        loadSessionHistory();
        return;
      }
      const parsed = JSON.parse(raw) as WellnessThread[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setThreads([]);
        setActiveThreadId(null);
        loadSessionHistory();
        return;
      }
      setThreads(parsed);
      setActiveThreadId(parsed[0]?.id ?? null);
      loadSessionHistory();
    } catch {
      setThreads([]);
      setActiveThreadId(null);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
    } catch {
      // ignore storage failures
    }
  }, [threads]);

  return (
    <motion.div
      style={styles.page}
      className="fade-in"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* BACKGROUND PATTERN */}
      <img src={wellnessBg} alt="" style={styles.bgPattern} />

      <div style={styles.layout}>
        {/* HAMBURGER TOGGLE (visible when sidebar closed) */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            style={{
              position: "fixed",
              top: "20px",
              left: "20px",
              zIndex: 60,
              background: "rgba(255,255,255,0.8)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: "8px",
              padding: "8px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Menu size={24} color="#2B2B2B" />
          </button>
        )}

        {/* LEFT HISTORY SIDEBAR */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              style={{
                ...styles.sidebar,
                ...(isMobile ? styles.sidebarMobile : {}),
              }}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div style={styles.sidebarHeader}>
                <div style={styles.sidebarTitle}>History</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <motion.button
                    type="button"
                    style={styles.newChatBtn}
                    className="press"
                    onClick={() => {
                      startNewThread();
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    + New
                  </motion.button>
                  {/* CLOSE SIDEBAR BTN */}
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                  >
                    <X size={20} color="#6B6B6B" />
                  </button>
                </div>
              </div>

              <div style={styles.historyList}>
                {threads.length === 0 ? (
                  <div style={styles.historyEmpty}>No history yet</div>
                ) : (
                  threads.map((t) => {
                    const isActive = t.id === activeThreadId;
                    return (
                      <motion.button
                        key={t.id} // Added key here
                        type="button"
                        style={{
                          ...styles.historyItem,
                          ...(isActive ? styles.historyItemActive : {}),
                        }}
                        className="press"
                        onClick={() => {
                          setActiveThreadId(t.id);
                          if (isMobile) setIsSidebarOpen(false);
                        }}
                        title={t.title}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div style={styles.historyItemTitle}>{t.title}</div>
                        <div style={styles.historyMeta}>
                          {formatTime(t.createdAt)}
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* MAIN */}
        <main
          style={{
            ...styles.main,
            marginLeft: isSidebarOpen && !isMobile ? "280px" : "0", // Push content on desktop
            transition:
              "margin-left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          }}
        >
          {/* Back Arrow - Conditional rendering or adjust position if conflicting */}
          {!isSidebarOpen && (
            <button
              type="button"
              style={styles.back}
              className="press"
              aria-label="Go back"
              onClick={() => navigate("/dashboard")}
            >
              ←
            </button>
          )}

          {/* Icon */}
          <div style={styles.iconCircle}>
            <span style={styles.heart}>♡</span>
          </div>

          {/* Titles */}
          <h1 style={styles.title}>Today's Wellness</h1>
          <h2 style={styles.subtitle}>How are you feeling?</h2>

          {/* Error Banner */}
          {errorMessage && (
            <motion.div
              style={styles.errorBanner}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <span style={styles.errorIcon}>⚠️</span>
              <span style={styles.errorText}>{errorMessage}</span>
              <button
                style={styles.errorClose}
                onClick={() => setErrorMessage(null)}
              >
                ×
              </button>
            </motion.div>
          )}

          {/* Hidden audio element */}
          <audio ref={audioRef} style={{ display: "none" }} />

          {/* AI ANALYSIS (CHAT) */}
          <motion.div
            style={styles.analysisBox}
            className="fade-up"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 style={styles.analysisTitle}>AI Analysis</h3>
            <div style={styles.messages} aria-label="Conversation">
              {activeThread?.messages?.length ? (
                activeThread.messages.map((m) => {
                  const isUser = m.role === "user";
                  if (isUser) return null; // Hide user messages
                  return (
                    <motion.div
                      key={m.id}
                      style={{
                        ...styles.msgRow,
                        justifyContent: isUser ? "flex-end" : "flex-start",
                      }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          maxWidth: "78%",
                        }}
                      >
                        <div style={styles.msgBubbleAssistant}>
                          {/* Only animate the very last message if it's new-ish or always? 
                              User request: "AI responses should appear... word-by-word"
                              We apply Typewriter to all AI messages for consistency or just the last one.
                              Typically only the last one needs to 'stream'. 
                          */}
                          {m.id ===
                          activeThread.messages[
                            activeThread.messages.length - 1
                          ].id ? (
                            <Typewriter text={m.content} />
                          ) : (
                            m.content
                          )}
                        </div>

                        {/* Emotion Badge - Hide if Neutral */}
                        {!isUser &&
                          m.emotion &&
                          m.emotion.primary.toLowerCase() !== "neutral" && (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-start",
                              }}
                            >
                              <EmotionBadge
                                emotion={m.emotion.primary}
                                intensity={m.emotion.intensity}
                              />
                            </div>
                          )}

                        {!isUser && m.isCrisis && (
                          <CrisisHelpline
                            crisisLevel={m.crisisLevel || "moderate"}
                          />
                        )}

                        {!isUser &&
                          m.recommendations &&
                          m.recommendations.length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                              }}
                            >
                              {m.recommendations.map((rec) => (
                                <RecommendationCard
                                  key={rec.knowledge_id}
                                  recommendation={rec}
                                />
                              ))}
                            </div>
                          )}
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div style={styles.messagesEmpty}>
                  Tell me how you are feeling today...
                </div>
              )}
            </div>
          </motion.div>

          {/* INPUT ROW */}
          <div style={styles.inputRow}>
            {/* Voice Recording UI */}
            {isRecordingMode && (
              <motion.div
                style={styles.voiceRecorderContainer}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <VoiceRecorder
                  isRecording={isRecording}
                  isPaused={false}
                  duration={duration}
                  audioLevel={0}
                  onStart={handleStartRecording}
                  onStop={handleStopRecording}
                  onPause={() => {}}
                  onResume={() => {}}
                  onCancel={handleCancelRecording}
                  error={voiceError}
                />
              </motion.div>
            )}

            {/* LEFT MAIN INPUT */}
            {!isRecordingMode && (
              <div
                ref={voiceAreaRef}
                style={{
                  ...styles.inputBox,
                  ...(isFocused ? styles.inputBoxFocused : {}),
                }}
                className="soft-hover"
              >
                <textarea
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Type or tap the mic to speak..."
                  style={styles.textarea}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.ctrlKey &&
                      !e.metaKey
                    ) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />

                <div style={styles.inputFooter}>
                  {validationError ? (
                    <span style={styles.validationError}>
                      {validationError}
                    </span>
                  ) : (
                    <span
                      style={{
                        ...styles.charCounter,
                        ...(inputText.length > MAX_MESSAGE_LENGTH
                          ? styles.charCounterError
                          : {}),
                      }}
                    >
                      {inputText.length} / {MAX_MESSAGE_LENGTH}
                    </span>
                  )}
                </div>

                <div style={styles.actionRow}>
                  {isLoading ? (
                    <div style={styles.loadingIndicator}>
                      <div style={styles.spinner}></div>
                      <span style={{ fontSize: "14px", color: "#6B6B6B" }}>
                        Thinking...
                      </span>
                    </div>
                  ) : (
                    <>
                      <button
                        style={{
                          ...styles.sendBtn,
                          ...(inputText.trim().length === 0 ||
                          inputText.length > MAX_MESSAGE_LENGTH
                            ? styles.sendBtnDisabled
                            : {}),
                        }}
                        className="press"
                        type="button"
                        onClick={sendMessage}
                        disabled={
                          inputText.trim().length === 0 ||
                          inputText.length > MAX_MESSAGE_LENGTH
                        }
                      >
                        Send
                      </button>

                      <button
                        style={styles.voiceBtn}
                        className="press"
                        onClick={() => {
                          setIsRecordingMode(true);
                          handleStartRecording();
                        }}
                        type="button"
                        title="Voice Input"
                      >
                        <Mic size={20} color="#2B2B2B" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default TodaysWellness;

/* ===================== STYLES ===================== */

/* STYLE UPDATES */
const styles: { [key: string]: React.CSSProperties } = {
  sidebar: {
    width: "280px",
    height: "100vh",
    position: "fixed",
    top: 0,
    left: 0,
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(12px)",
    borderRight: "1px solid rgba(0, 0, 0, 0.05)",
    boxShadow: "4px 0 24px rgba(0,0,0,0.06)",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    zIndex: 100,
  },

  sidebarMobile: {
    width: "85%", // Mobile width
    maxWidth: "320px",
  },

  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },

  sidebarTitle: {
    fontSize: "15px",
    fontWeight: 600,
    color: "#2B2B2B",
    letterSpacing: "0.3px",
  },

  newChatBtn: {
    border: "none",
    borderRadius: "12px",
    padding: "7px 11px",
    cursor: "pointer",
    background: "linear-gradient(135deg, #DCEAD7 0%, #C8DFC3 100%)",
    color: "#2B2B2B",
    fontSize: "13px",
    fontWeight: 600,
    boxShadow: "0 2px 8px rgba(143, 169, 143, 0.22)",
    transition: "transform 0.2s ease",
  },

  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    overflowY: "auto",
    paddingRight: "4px",
  },

  historyEmpty: {
    fontSize: "13px",
    color: "#6B6B6B",
    padding: "10px 6px",
  },

  historyItem: {
    border: "1px solid rgba(0, 0, 0, 0.06)",
    background: "rgba(250, 247, 242, 0.9)",
    borderRadius: "14px",
    padding: "10px 10px",
    cursor: "pointer",
    textAlign: "left",
    transition: "transform 0.2s ease",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  historyItemActive: {
    border: "1px solid rgba(143, 169, 143, 0.55)",
    background:
      "linear-gradient(135deg, rgba(220, 234, 215, 0.85) 0%, rgba(208, 228, 203, 0.85) 100%)",
  },

  historyItemTitle: {
    fontSize: "13px",
    color: "#2B2B2B",
    fontWeight: 600,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  historyMeta: {
    fontSize: "12px",
    color: "#6B6B6B",
  },

  main: {
    flex: 1,
    position: "relative",
    height: "100%",
    width: "100%",
    maxWidth: "100%",
    padding: "6px 16px 20px",
    display: "flex",
    flexDirection: "column",
    overflowX: "hidden",
  },

  bgPattern: {
    position: "absolute",
    top: 0,
    left: 0,
    transform: "translate(-50%, -50%)",
    width: "100%",
    height: "100%",
    objectFit: "contain",
    opacity: 0.22,
    zIndex: 0,
    pointerEvents: "none",
    animation: "subtleFloat 20s ease-in-out infinite",
  },

  back: {
    fontSize: "24px",
    cursor: "pointer",
    position: "absolute",
    top: "20px",
    right: "20px",
    zIndex: 90,
    border: "none",
    background: "transparent",
    padding: 0,
    left: "auto",
  },

  ttsButton: {
    background: "#F5F5F5",
    border: "1px solid #E0E0E0",
    borderRadius: "6px",
    padding: "4px 8px",
    fontSize: "11px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    cursor: "pointer",
    color: "#555",
    transition: "background 0.2s",
  },

  voiceBtn: {
    background: "#EDF2EB",
    border: "1px solid #DCEAD7",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  voiceRecorderContainer: {
    width: "100%",
    maxWidth: "800px",
    margin: "0 auto",
  },

  analysisBox: {
    width: "100%",
    maxWidth: "1000px",
    flex: 1,
    minHeight: "300px",
    margin: "10px auto 20px",
    background: "linear-gradient(135deg, #FFF9F0 0%, #FFF5E0 100%)",
    borderRadius: "24px",
    padding: "20px",
    border: "1px solid rgba(240, 192, 138, 0.3)",
    position: "relative",
    zIndex: 1,
    boxShadow: "0 4px 20px rgba(240, 192, 138, 0.1)",
    display: "flex",
    flexDirection: "column",
  },

  analysisTitle: {
    fontSize: "20px",
    margin: 0,
    color: "#7A7A7A",
    fontWeight: "500",
  },

  messages: {
    marginTop: "14px",
    flex: 1,
    overflowY: "auto",
    paddingRight: "6px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  messagesEmpty: {
    color: "#7A7A7A",
    fontSize: "14px",
    paddingTop: "12px",
  },

  msgRow: {
    display: "flex",
    width: "100%",
  },

  msgBubbleUser: {
    maxWidth: "78%",
    background: "rgba(220, 234, 215, 0.95)",
    border: "1px solid rgba(143, 169, 143, 0.35)",
    padding: "10px 12px",
    borderRadius: "14px",
    color: "#2B2B2B",
    lineHeight: 1.5,
    boxShadow: "0 2px 10px rgba(143, 169, 143, 0.12)",
  },

  msgBubbleAssistant: {
    maxWidth: "90%",
    background: "#DCEAD7", // Greenish tint from Sama Assistant
    border: "1px solid rgba(0, 0, 0, 0.05)",
    padding: "16px",
    borderRadius: "18px 18px 18px 6px",
    fontSize: "16px",
    lineHeight: 1.6,
    color: "#2C3E2D",
    boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
  },

  loadingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "7px 12px",
  },

  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid #E0E0E0",
    borderTop: "2px solid #8FA98F",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  errorBanner: {
    width: "100%",
    maxWidth: "1086px",
    margin: "0 auto 12px",
    background: "linear-gradient(135deg, #FFE5E5 0%, #FFD5D5 100%)",
    border: "1px solid #FF9999",
    borderRadius: "12px",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 2px 8px rgba(255, 0, 0, 0.1)",
    position: "relative",
    zIndex: 2,
  },

  errorIcon: {
    fontSize: "18px",
  },

  errorText: {
    flex: 1,
    fontSize: "14px",
    color: "#CC0000",
    fontWeight: 500,
  },

  errorClose: {
    background: "transparent",
    border: "none",
    fontSize: "24px",
    color: "#CC0000",
    cursor: "pointer",
    padding: "0 4px",
    lineHeight: 1,
    transition: "transform 0.2s ease",
  },

  audioPlayerContainer: {
    marginTop: "8px",
    display: "flex",
    justifyContent: "flex-start",
  },

  audioPlayer: {
    width: "100%",
    maxWidth: "300px",
    height: "40px",
    borderRadius: "8px",
    outline: "none",
  },

  page: {
    background: "#FAF7F2",
    minHeight: "100vh",
    padding: "0",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Georgia', serif",
    position: "relative",
    overflow: "hidden",
  },

  layout: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    height: "100vh",
    position: "relative",
  },

  iconCircle: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #DCEAD7 0%, #C8DFC3 100%)",
    margin: "10px auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(143, 169, 143, 0.2)",
  },

  heart: {
    fontSize: "24px",
    color: "#8FA98F",
  },

  title: {
    textAlign: "center",
    fontSize: "22px",
    margin: "4px 0",
    fontWeight: "600",
    letterSpacing: "0.5px",
    color: "#2C3E2D",
  },

  subtitle: {
    textAlign: "center",
    fontSize: "16px",
    marginBottom: "20px",
    fontWeight: "400",
    color: "#8FA98F",
  },

  inputRow: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "0px",
    position: "relative",
    zIndex: 1,
  },

  inputBox: {
    width: "100%",
    maxWidth: "1086px",
    height: "140px",
    background: "linear-gradient(135deg, #DCEAD7 0%, #D0E4CB 100%)",
    borderRadius: "18px",
    padding: "16px",
    position: "relative",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  },

  inputBoxFocused: {
    boxShadow: "0 4px 16px rgba(143, 169, 143, 0.3)",
    transform: "translateY(-2px)",
  },

  textarea: {
    width: "100%",
    height: "58px",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#333",
    fontSize: "16px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Georgia', serif",
    resize: "none",
    lineHeight: "1.5",
  },

  inputFooter: {
    position: "absolute",
    left: "16px",
    bottom: "50px",
    display: "flex",
    alignItems: "center",
  },

  charCounter: {
    fontSize: "12px",
    color: "#6B6B6B",
    fontWeight: 500,
  },

  charCounterError: {
    color: "#CC0000",
  },

  validationError: {
    fontSize: "12px",
    color: "#CC0000",
    fontWeight: 500,
  },

  actionRow: {
    position: "absolute",
    right: "14px",
    bottom: "12px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  sendBtn: {
    background: "linear-gradient(135deg, #FFF3D9 0%, #FFF0C8 100%)",
    border: "1px solid rgba(240, 192, 138, 0.65)",
    borderRadius: "12px",
    padding: "7px 12px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
    fontWeight: 600,
    color: "#2B2B2B",
  },

  sendBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
};
