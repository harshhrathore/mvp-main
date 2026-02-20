import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Volume2 } from "lucide-react";

import {
  chatAPIClient,
  ChatAPIError,
  type Recommendation,
} from "../api/chatClient";
import {
  CrisisHelpline,
  EmotionBadge,
  RecommendationCard,
  VoiceRecorder,
} from "../components/wellness";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder";

import bgImage from "../assets/wellness-bg.png";
import micIcon from "../assets/mic-icon.png";

const TypingIndicator = () => (
  <div
    style={{
      display: "flex",
      gap: "4px",
      alignItems: "center",
      padding: "0 4px",
    }}
  >
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: "#8FA98F",
        }}
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: i * 0.2,
        }}
      />
    ))}
  </div>
);

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
    }, 15);
    return () => clearInterval(interval);
  }, [text, onComplete]);

  return <>{displayed}</>;
};

type ChatRole = "ai" | "user";
type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  emotion?: {
    primary: string;
    intensity: number;
  };
  recommendations?: Recommendation[];
  isCrisis?: boolean;
  crisisLevel?: string;
  audioUrl?: string;
  isVoice?: boolean;
};

type ChatThread = {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
};

const STORAGE_KEY = "samaa:aiWellnessGuide:threads";

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

const seedMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "ai",
    text: "Hello, I’m here to guide your wellness journey.",
  },
  {
    id: "m2",
    role: "user",
    text: "I’m feeling stressed lately.",
  },
];

const AIWellnessGuide: React.FC = () => {
  const navigate = useNavigate();

  const [input, setInput] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRecordingMode, setIsRecordingMode] = useState(false);

  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // Responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);

  // Voice recording hook
  const {
    isRecording,
    duration,
    error: voiceError,
    startRecording,
    stopRecording,
    resetError,
  } = useVoiceRecorder(120); // 2 minutes max

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && !isSidebarOpen) setIsSidebarOpen(true);
      if (mobile && isSidebarOpen) setIsSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen]);

  const endRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(
    () => input.trim().length > 0 && !isReplying,
    [input, isReplying],
  );

  const activeThread =
    threads.find((t) => t.id === activeThreadId) ?? threads[0] ?? null;
  const activeMessages = activeThread?.messages ?? [];

  const startNewThread = (opts?: { makeActive?: boolean }) => {
    const now = Date.now();
    const newThread: ChatThread = {
      id: makeId(),
      title: "New chat",
      createdAt: now,
      messages: [
        {
          id: makeId(),
          role: "ai",
          text: "Hello — tell me what you’re feeling today, and I’ll suggest a simple yoga or breathing step.",
        },
      ],
    };
    setThreads((prev) => [newThread, ...prev]);
    if (opts?.makeActive !== false) setActiveThreadId(newThread.id);
    setInput("");
    setIsReplying(false);
    return newThread;
  };

  const appendToThread = (threadId: string, msg: ChatMessage) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        const nextTitle =
          t.title === "New chat" && msg.role === "user"
            ? msg.text.length > 34
              ? `${msg.text.slice(0, 34)}…`
              : msg.text
            : t.title;
        return { ...t, title: nextTitle, messages: [...t.messages, msg] };
      }),
    );
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeMessages.length, isReplying, activeThreadId]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const now = Date.now();
        const initial: ChatThread = {
          id: makeId(),
          title: "New chat",
          createdAt: now,
          messages: seedMessages,
        };
        setThreads([initial]);
        setActiveThreadId(initial.id);
        return;
      }
      const parsed = JSON.parse(raw) as ChatThread[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        setThreads([]);
        setActiveThreadId(null);
        return;
      }
      setThreads(parsed);
      setActiveThreadId(parsed[0]?.id ?? null);
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
        const t = startNewThread({ makeActive: true });
        return;
      }

      setIsReplying(true);
      setErrorMessage(null);
      setIsRecordingMode(false);

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

          const userMsg: ChatMessage = {
            id: `u-${Date.now()}`,
            role: "user",
            text: transcript,
            isVoice: true,
          };

          appendToThread(threadId, userMsg);

          const aiMsg: ChatMessage = {
            id: `a-${Date.now()}`,
            role: "ai",
            text: reply_text,
            emotion: emotion,
            recommendations: recommendations,
            isCrisis: is_crisis,
            crisisLevel: crisis_level,
            audioUrl: reply_audio_url || undefined,
            isVoice: true,
          };

          appendToThread(threadId, aiMsg);

          // Auto-play audio if available
          if (reply_audio_url && audioRef.current) {
            audioRef.current.src = reply_audio_url;
            audioRef.current.play().catch(console.error);
          }
        }
      } catch (error) {
        console.error("Failed to send voice message:", error);
        if (error instanceof ChatAPIError) {
          if (error.isAuthError) {
            setErrorMessage(error.message);
            localStorage.removeItem("token");
            setTimeout(() => {
              navigate("/login", {
                state: { returnUrl: "/ai-wellness-guide" },
              });
            }, 1500);
            return;
          }
          setErrorMessage(error.message);
        } else {
          setErrorMessage("Failed to process voice message. Please try again.");
        }

        const errorMsg: ChatMessage = {
          id: `e-${Date.now()}`,
          role: "ai",
          text:
            error instanceof ChatAPIError
              ? error.message
              : "I'm having trouble processing your voice message. Please try again.",
        };
        appendToThread(threadId, errorMsg);
      } finally {
        setIsReplying(false);
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
    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch(console.error);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || isReplying) return;

    let threadId = activeThreadId;
    if (!threadId) {
      const t = startNewThread({ makeActive: true });
      threadId = t.id;
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
    };

    appendToThread(threadId, userMsg);
    setInput("");
    setIsReplying(true);
    setErrorMessage(null);

    try {
      const response = await chatAPIClient.sendTextMessage(text);

      if (response.success && response.data) {
        const { reply, emotion, recommendations, is_crisis, crisis_level } =
          response.data;

        const aiMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: "ai",
          text: reply,
          emotion: emotion,
          recommendations: recommendations,
          isCrisis: is_crisis,
          crisisLevel: crisis_level,
        };

        appendToThread(threadId, aiMsg);
      }
    } catch (error) {
      console.error("Failed to send message:", error);

      if (error instanceof ChatAPIError) {
        if (error.isAuthError) {
          setErrorMessage(error.message);
          localStorage.removeItem("token");
          setTimeout(() => {
            navigate("/login", { state: { returnUrl: "/ai-wellness-guide" } });
          }, 1500);
          return;
        }
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }

      const errorMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        role: "ai",
        text:
          error instanceof ChatAPIError
            ? error.message
            : "I'm having trouble connecting right now. Please try again.",
      };
      appendToThread(threadId, errorMsg);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div style={styles.page} className="fade-in">
      <div style={styles.layout}>
        {/* LEFT HISTORY SIDEBAR */}
        <AnimatePresence mode="popLayout">
          {isSidebarOpen && (
            <motion.aside
              style={{
                ...styles.sidebar,
                ...(isMobile ? styles.sidebarMobile : {}),
              }}
              aria-label="Chat history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div style={styles.sidebarHeader}>
                <div style={styles.sidebarTitle}>History</div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <motion.button
                    type="button"
                    style={styles.newChatBtn}
                    className="press"
                    onClick={() => {
                      startNewThread({ makeActive: true });
                      if (isMobile) setIsSidebarOpen(false);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    + New
                  </motion.button>
                  {/* Close Sidebar Button (Always visible) */}
                  <motion.button
                    onClick={() => setIsSidebarOpen(false)}
                    style={styles.closeSidebarBtn}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Close sidebar"
                  >
                    <X size={18} color="#6B6B6B" />
                  </motion.button>
                </div>
              </div>

              <div style={styles.historyList}>
                {threads.length === 0 ? (
                  <div style={styles.historyEmpty}>No history yet</div>
                ) : (
                  threads.map((t) => {
                    const isActive =
                      t.id === (activeThreadId ?? activeThread?.id);
                    return (
                      <motion.button
                        key={t.id}
                        type="button"
                        style={{
                          ...styles.historyItem,
                          ...(isActive ? styles.historyItemActive : {}),
                        }}
                        className="press"
                        onClick={() => {
                          setActiveThreadId(t.id);
                          setIsReplying(false);
                        }}
                        title={t.title}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
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
            width: isSidebarOpen ? "auto" : "100%",
            maxWidth: isSidebarOpen ? "auto" : "100%",
          }}
        >
          {/* MENU TOGGLE BUTTON */}
          {!isSidebarOpen && (
            <motion.button
              onClick={() => setIsSidebarOpen(true)}
              style={styles.menuToggleBtn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              title="Open sidebar"
            >
              <Menu size={24} color="#2B2B2B" />
            </motion.button>
          )}
          {/* HEADER */}
          <div style={styles.header}>
            <button
              style={styles.backButton}
              onClick={() => navigate("/dashboard")}
              className="press"
              title="Back to dashboard"
            >
              ←
            </button>
            <h1
              style={{
                ...styles.headerTitle,
                marginLeft: !isSidebarOpen && isMobile ? "40px" : "0",
              }}
              className="fade-up"
            >
              Sama AI
            </h1>
          </div>

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

          {/* CHAT AREA */}
          <div style={styles.chatArea}>
            <div style={styles.messages}>
              <AnimatePresence initial={false}>
                {activeMessages.map((m) => {
                  const isAI = m.role === "ai";
                  return (
                    <motion.div
                      key={m.id}
                      style={
                        isAI ? styles.messageRowLeft : styles.messageRowRight
                      }
                      initial={
                        isAI ? { opacity: 0, y: 8 } : { opacity: 0, x: 20 }
                      }
                      animate={
                        isAI ? { opacity: 1, y: 0 } : { opacity: 1, x: 0 }
                      }
                      transition={{
                        duration: isAI ? 0.3 : 0.25,
                        ease: isAI ? "easeOut" : [0.2, 0.9, 0.4, 1],
                      }}
                    >
                      {isAI && (
                        <div style={styles.pfp} aria-hidden="true">
                          🤖
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          maxWidth: "min(80%, 500px)",
                        }}
                      >
                        <div style={isAI ? styles.aiBubble : styles.userBubble}>
                          {isAI &&
                          m.id ===
                            activeMessages[activeMessages.length - 1]?.id ? (
                            <Typewriter text={m.text} />
                          ) : (
                            m.text
                          )}
                        </div>

                        {/* Emotion Badge - Hide if Neutral */}
                        {isAI &&
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

                        {/* Crisis Helpline */}
                        {isAI && m.isCrisis && (
                          <CrisisHelpline
                            crisisLevel={m.crisisLevel || "moderate"}
                          />
                        )}

                        {/* Recommendations */}
                        {isAI &&
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

                        {/* Audio playback for voice messages */}
                        {isAI && m.audioUrl && (
                          <button
                            onClick={() => playAudio(m.audioUrl!)}
                            style={styles.audioButton}
                          >
                            🔊 Play Audio Response
                          </button>
                        )}
                      </div>
                      {!isAI && (
                        <div style={styles.pfp} aria-hidden="true">
                          🧑
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              <AnimatePresence>
                {isReplying && (
                  <motion.div
                    key="typing"
                    style={styles.messageRowLeft}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      style={styles.pfp}
                      aria-hidden="true"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      🤖
                    </motion.div>
                    <div style={{ ...styles.aiBubble, ...styles.typingBubble }}>
                      <TypingIndicator />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={endRef} />
            </div>
          </div>

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

          {/* INPUT BAR */}
          {!isRecordingMode && (
            <motion.form
              style={styles.inputBar}
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              animate={{
                borderColor: inputFocused ? "#8FA98F" : "rgba(0,0,0,0.06)",
                boxShadow: inputFocused
                  ? "0 4px 12px rgba(143,169,143,0.2)"
                  : "0 2px 6px rgba(0,0,0,0.05)",
              }}
              transition={{ duration: 0.2 }}
            >
              <input
                style={styles.input}
                placeholder="Type something..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                disabled={isReplying}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <div style={styles.buttonGroup}>
                {isReplying ? (
                  <div style={styles.loadingIndicator}>
                    <div style={styles.spinner}></div>
                  </div>
                ) : (
                  <>
                    <motion.button
                      type="button"
                      style={styles.mic}
                      className="press"
                      aria-label="Voice input"
                      onClick={() => {
                        setIsRecordingMode(true);
                        handleStartRecording();
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <img
                        src={micIcon}
                        alt="mic"
                        style={{ width: 30, height: 30, display: "block" }}
                      />
                    </motion.button>
                    <motion.button
                      type="submit"
                      style={{
                        ...styles.send,
                        ...(canSend ? {} : styles.sendDisabled),
                      }}
                      className="press"
                      disabled={!canSend}
                      animate={{
                        opacity: canSend ? 1 : 0.5,
                        scale: canSend ? 1 : 0.95,
                      }}
                      transition={{ duration: 0.2 }}
                      whileHover={canSend ? { scale: 1.05 } : {}}
                      whileTap={canSend ? { scale: 0.95 } : {}}
                    >
                      Send
                    </motion.button>
                  </>
                )}
              </div>
            </motion.form>
          )}
        </main>
      </div>
    </div>
  );
};

export default AIWellnessGuide;

/* ================= STYLES ================= */

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#FAF7F2",
    fontFamily:
      "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Apple Color Emoji, Segoe UI Emoji",
  },

  layout: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    gap: "clamp(10px, 2vw, 16px)",
    padding: "clamp(10px, 2vw, 16px)",
  },

  /* SIDEBAR */
  sidebar: {
    width: "clamp(220px, 22vw, 320px)",
    borderRadius: "18px",
    padding: "14px",
    background: "rgba(255, 255, 255, 0.55)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    zIndex: 10,
  },

  sidebarMobile: {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: "80%",
    maxWidth: "300px",
    background: "rgba(255, 255, 255, 0.95)",
    margin: 0,
    borderRadius: 0,
    zIndex: 100,
    boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  sidebarTitle: {
    fontWeight: 700,
    letterSpacing: "0.2px",
    color: "rgba(30,30,30,0.92)",
  },
  newChatBtn: {
    border: "1px solid rgba(0,0,0,0.10)",
    background: "rgba(255,255,255,0.55)",
    borderRadius: "999px",
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: "14px",
  },
  closeSidebarBtn: {
    border: "1px solid rgba(0,0,0,0.10)",
    background: "rgba(255,255,255,0.55)",
    borderRadius: "8px",
    padding: "6px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  menuToggleBtn: {
    position: "absolute",
    top: "20px",
    left: "20px",
    zIndex: 50,
    background: "rgba(255,255,255,0.7)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: "10px",
    padding: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  historyList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    overflowY: "auto",
    paddingRight: "2px",
  },
  historyEmpty: {
    padding: "10px",
    color: "rgba(30,30,30,0.65)",
    fontSize: "14px",
  },
  historyItem: {
    textAlign: "left",
    border: "1px solid rgba(0,0,0,0.06)",
    background: "rgba(255,255,255,0.45)",
    borderRadius: "14px",
    padding: "10px 10px",
    cursor: "pointer",
  },
  historyItemActive: {
    border: "1px solid rgba(143,169,143,0.55)",
    background: "rgba(220,234,215,0.55)",
  },
  historyItemTitle: {
    fontSize: "14px",
    fontWeight: 700,
    color: "rgba(30,30,30,0.9)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  historyMeta: {
    marginTop: "4px",
    fontSize: "12px",
    color: "rgba(30,30,30,0.55)",
  },

  /* MAIN */
  main: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    borderRadius: "18px",
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.06)",
    background: "rgba(255,255,255,0.35)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
  },

  /* HEADER */
  header: {
    display: "flex",
    alignItems: "center",
    padding: "clamp(12px, 2vw, 16px) clamp(16px, 3vw, 24px)",
    gap: "clamp(12px, 2vw, 16px)",
    background: "rgba(250, 247, 242, 0.6)",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
  },
  back: {
    fontSize: "clamp(20px, 3vw, 24px)",
    cursor: "pointer",
    border: "none",
    background: "transparent",
    padding: 0,
  },
  backButton: {
    fontSize: "clamp(20px, 3vw, 24px)",
    cursor: "pointer",
    border: "none",
    background: "transparent",
    padding: 0,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: "clamp(20px, 4vw, 30px)",
    marginRight: "clamp(20px, 3vw, 40px)",
  },

  /* CHAT */
  chatArea: {
    flex: 1,
    minHeight: 0,
    position: "relative",
    overflowY: "auto",
    padding:
      "clamp(14px, 3vw, 28px) clamp(12px, 4vw, 40px) clamp(12px, 2vw, 22px)",
    backgroundImage: `linear-gradient(rgba(250, 247, 242, 0.78), rgba(250, 247, 242, 0.78)), url(${bgImage})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "left -60px top 40px",
    backgroundSize: "auto 520px",
  },

  messages: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    maxWidth: "980px",
    margin: "0 auto",
  },

  messageRowLeft: {
    display: "flex",
    alignItems: "flex-end",
    gap: "12px",
    marginBottom: "20px",
    position: "relative",
    zIndex: 1,
  },

  messageRowRight: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    gap: "12px",
    marginBottom: "20px",
    position: "relative",
    zIndex: 1,
  },

  pfp: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "#C0C0C0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },

  aiBubble: {
    maxWidth: "min(80%, 500px)",
    background: "linear-gradient(135deg, #DCEAD7 0%, #E8F3E3 100%)",
    padding: "clamp(12px, 2vw, 16px) clamp(14px, 2vw, 20px)",
    borderRadius: "18px 18px 18px 6px",
    fontSize: "clamp(15px, 2vw, 17px)",
    lineHeight: 1.6,
    wordBreak: "keep-all",
    overflowWrap: "break-word",
    whiteSpace: "pre-wrap",
    border: "1px solid rgba(143,169,143,0.2)",
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255,255,255,0.5)",
    minWidth: "fit-content",
  },

  typingBubble: {
    opacity: 0.85,
  },

  userBubble: {
    maxWidth: "min(80%, 500px)",
    background: "linear-gradient(135deg, #FFE3D4 0%, #FFD9C7 100%)",
    padding: "clamp(12px, 2vw, 16px) clamp(14px, 2vw, 20px)",
    borderRadius: "18px 18px 6px 18px",
    fontSize: "clamp(15px, 2vw, 17px)",
    lineHeight: 1.6,
    wordBreak: "keep-all",
    overflowWrap: "break-word",
    whiteSpace: "pre-wrap",
    border: "1px solid rgba(214,138,106,0.2)",
    boxShadow:
      "0 4px 12px rgba(0,0,0,0.08), inset 0 1px 2px rgba(255,255,255,0.3)",
    minWidth: "fit-content",
  },

  /* INPUT BAR */
  inputBar: {
    background:
      "linear-gradient(180deg, rgba(220,234,215,0.95) 0%, rgba(220,234,215,1) 100%)",
    display: "flex",
    alignItems: "center",
    gap: "clamp(8px, 2vw, 12px)",
    padding: "clamp(12px, 2vw, 16px) clamp(14px, 2vw, 20px)",
    paddingBottom: "calc(clamp(12px, 2vw, 16px) + env(safe-area-inset-bottom))",
    borderTop: "1px solid rgba(143,169,143,0.3)",
    boxShadow: "0 -2px 10px rgba(0,0,0,0.05)",
  },

  buttonGroup: {
    display: "flex",
    alignItems: "center",
    gap: "clamp(8px, 1.5vw, 10px)",
  },

  mic: {
    padding: "6px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.2s ease",
  },

  input: {
    flex: 1,
    border: "1px solid rgba(143,169,143,0.2)",
    background: "rgba(255,255,255,0.7)",
    fontSize: "clamp(15px, 2vw, 17px)",
    outline: "none",
    padding: "10px 14px",
    borderRadius: "12px",
    transition: "all 0.2s ease",
  },

  send: {
    background: "linear-gradient(135deg, #8FA98F 0%, #7d9b7f 100%)",
    border: "none",
    borderRadius: "12px",
    padding: "clamp(8px, 1vw, 10px) clamp(18px, 2vw, 24px)",
    fontSize: "clamp(15px, 2vw, 17px)",
    fontWeight: 600,
    cursor: "pointer",
    color: "#FFFFFF",
    boxShadow: "0 2px 8px rgba(143,169,143,0.3)",
    transition: "all 0.2s ease",
  },

  sendDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },

  errorBanner: {
    width: "100%",
    margin: "0 16px 12px",
    background: "linear-gradient(135deg, #FFE5E5 0%, #FFD5D5 100%)",
    border: "1px solid #FF9999",
    borderRadius: "12px",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 2px 8px rgba(255, 0, 0, 0.1)",
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

  audioButton: {
    background: "#EDF2EB",
    border: "1px solid #DCEAD7",
    borderRadius: "8px",
    padding: "6px 12px",
    fontSize: "12px",
    cursor: "pointer",
    color: "#2B2B2B",
    fontWeight: 500,
  },

  voiceRecorderContainer: {
    width: "100%",
    padding: "16px",
    background: "#DCEAD7",
    borderTop: "1px solid rgba(0,0,0,0.06)",
  },

  loadingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 12px",
  },

  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid #E0E0E0",
    borderTop: "2px solid #8FA98F",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};
