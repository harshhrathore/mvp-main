import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import breathingBg from "../assets/breathing-bg.png";

type Phase = "Inhale" | "Hold" | "Exhale" | "Hold2";

type PatternKey = "vata" | "pitta" | "kapha";

type BreathingPattern = {
  key: PatternKey;
  label: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
};

// Frontend-only defaults. Later you can replace these with backend values.
const PATTERNS: Record<PatternKey, BreathingPattern> = {
  vata: {
    key: "vata",
    label: "Vata",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
  },
  pitta: {
    key: "pitta",
    label: "Pitta",
    inhale: 4,
    hold1: 2,
    exhale: 6,
    hold2: 2,
  },
  kapha: {
    key: "kapha",
    label: "Kapha",
    inhale: 6,
    hold1: 2,
    exhale: 8,
    hold2: 2,
  },
};

const getDurationForPhase = (pattern: BreathingPattern, phase: Phase) => {
  if (phase === "Inhale") return pattern.inhale;
  if (phase === "Hold") return pattern.hold1;
  if (phase === "Exhale") return pattern.exhale;
  return pattern.hold2;
};

const nextPhase = (phase: Phase): Phase => {
  if (phase === "Inhale") return "Hold";
  if (phase === "Hold") return "Exhale";
  if (phase === "Exhale") return "Hold2";
  return "Inhale";
};

const BreathingBox: React.FC = () => {
  const navigate = useNavigate();

  const [patternKey, setPatternKey] = useState<PatternKey>("vata");
  const pattern = useMemo(() => PATTERNS[patternKey], [patternKey]);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [phase, setPhase] = useState<Phase>("Inhale");
  const [timeLeft, setTimeLeft] = useState(() =>
    getDurationForPhase(PATTERNS.vata, "Inhale"),
  );
  const [cycles, setCycles] = useState(0);

  const [isPatternDialogOpen, setIsPatternDialogOpen] = useState(false);

  const phaseLabel = phase === "Hold2" ? "Hold" : phase;
  const totalCycleSeconds =
    pattern.inhale + pattern.hold1 + pattern.exhale + pattern.hold2;

  useEffect(() => {
    if (!isRunning) return;
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 1) return prev - 1;

        let next: Phase = "Inhale";
        setPhase((prevPhase) => {
          next = nextPhase(prevPhase);
          if (prevPhase === "Hold2") setCycles((c) => c + 1);
          return next;
        });
        return getDurationForPhase(pattern, next);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, isPaused, pattern]);

  const start = () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsPaused(false);
    setCycles(0);
    setPhase("Inhale");
    setTimeLeft(getDurationForPhase(pattern, "Inhale"));
  };

  const togglePause = () => {
    if (!isRunning) return;
    setIsPaused((p) => !p);
  };

  const stop = () => {
    setIsRunning(false);
    setIsPaused(false);
    setCycles(0);
    setPhase("Inhale");
    setTimeLeft(getDurationForPhase(pattern, "Inhale"));
  };

  const handleSelectPattern = (key: PatternKey) => {
    setPatternKey(key);
    setIsPatternDialogOpen(false);

    setIsRunning(false);
    setIsPaused(false);
    setCycles(0);
    setPhase("Inhale");
    setTimeLeft(getDurationForPhase(PATTERNS[key], "Inhale"));
  };

  const patternSummary = useMemo(() => {
    return `Inhale ${pattern.inhale}s • Hold ${pattern.hold1}s • Exhale ${pattern.exhale}s • Hold ${pattern.hold2}s`;
  }, [pattern]);

  return (
    <div className="fade-in" style={styles.page}>
      {/* 🌿 BACKGROUND ILLUSTRATION */}
      <img
        src={breathingBg}
        alt=""
        className="float-slow"
        style={styles.bgImage}
      />

      {/* HEADER (match screenshot) */}
      <div style={styles.headerRow}>
        <BackButton />

        <div style={styles.headerCenter}>
          <h1 style={styles.title}>Breathing Box</h1>
          <div style={styles.headerDivider} />
        </div>

        <div style={styles.headerSpacer} />
      </div>

      <div style={styles.cycleRow}>
        <div style={styles.cycleCardWide}>
          <div style={styles.cycleLabel}>Cycle Completed</div>
          <div style={styles.cycleValue}>{cycles}</div>
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.mainGrid}>
        {/* LEFT */}
        <div style={styles.left}>
          <div
            style={{
              ...styles.circle,
              ...(isRunning ? styles.active : {}),
              ...(phase === "Inhale" ? styles.inhale : {}),
              ...(phase === "Exhale" ? styles.exhale : {}),
            }}
            className={isRunning ? "glow-soft" : undefined}
          >
            <div style={styles.icon} aria-hidden="true">
              <svg
                width="48"
                height="48"
                viewBox="0 0 56 56"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 22c6 0 6-8 12-8s6 8 12 8 6-8 12-8"
                  stroke="#8FA98F"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.9"
                />
                <path
                  d="M10 30c6 0 6-8 12-8s6 8 12 8 6-8 12-8"
                  stroke="#8FA98F"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.65"
                />
                <path
                  d="M10 38c6 0 6-8 12-8s6 8 12 8 6-8 12-8"
                  stroke="#8FA98F"
                  strokeWidth="3"
                  strokeLinecap="round"
                  opacity="0.45"
                />
              </svg>
            </div>
            <div style={styles.phase}>{phaseLabel}</div>
            <div style={styles.timer}>Time: {timeLeft}s</div>
          </div>

          <div style={styles.controlsRow}>
            {!isRunning ? (
              <button
                className="press"
                style={styles.startBtn}
                onClick={start}
                type="button"
              >
                Start
              </button>
            ) : (
              <>
                <button
                  className="press"
                  style={{
                    ...styles.pauseBtn,
                    ...(isPaused ? styles.pauseBtnPaused : {}),
                  }}
                  onClick={togglePause}
                  type="button"
                >
                  {isPaused ? "Resume" : "Pause"}
                </button>
                <button
                  className="press"
                  style={styles.stopBtn}
                  onClick={stop}
                  type="button"
                >
                  Stop
                </button>
              </>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div style={styles.right}>
          <div style={styles.infoBoxLarge}>
            <h2 style={styles.infoTitle}>How it works?</h2>
            <p style={styles.infoText}>
              {patternSummary}.
              <br />
              Total per cycle: {totalCycleSeconds}s.
            </p>

            <div style={styles.patternRow}>
              <button
                type="button"
                onClick={() => setIsPatternDialogOpen(true)}
                style={styles.patternBtn}
                className="press"
              >
                Breathing Type: {pattern.label}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BENEFITS (bottom row) */}
      <div style={styles.benefitsSection}>
        <h2 style={styles.benefitsTitle}>Benefits</h2>
        <div style={styles.benefits}>
          <span style={{ ...styles.pill, background: "#DFFBFF" }}>
            Reduce Anxiety
          </span>
          <span style={{ ...styles.pill, background: "#DFFFE7" }}>
            Improves Focus
          </span>
          <span style={{ ...styles.pill, background: "#E3E9FF" }}>
            Better Sleep
          </span>
          <span style={{ ...styles.pill, background: "#FFE1D6" }}>
            Stress Relief
          </span>
        </div>
      </div>

      {/* PATTERN DIALOG */}
      {isPatternDialogOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Select breathing type"
          style={styles.dialogOverlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsPatternDialogOpen(false);
          }}
        >
          <div style={styles.dialogCard} className="scale-in">
            <div style={styles.dialogHeader}>
              <div style={styles.dialogTitle}>Choose Breathing Type</div>
              <button
                type="button"
                onClick={() => setIsPatternDialogOpen(false)}
                aria-label="Close"
                style={styles.dialogClose}
                className="press"
              >
                ✕
              </button>
            </div>

            <div style={styles.dialogBody}>
              {(Object.keys(PATTERNS) as PatternKey[]).map((key) => {
                const p = PATTERNS[key];
                const isActive = key === patternKey;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSelectPattern(key)}
                    style={{
                      ...styles.dialogOption,
                      ...(isActive ? styles.dialogOptionActive : {}),
                    }}
                    className="press"
                  >
                    <div style={styles.dialogOptionTop}>
                      <strong>{p.label}</strong>
                      <span style={styles.dialogBadge}>
                        {p.inhale + p.hold1 + p.exhale + p.hold2}s
                      </span>
                    </div>
                    <div style={styles.dialogOptionSub}>
                      Inhale {p.inhale}s • Hold {p.hold1}s • Exhale {p.exhale}s
                      • Hold {p.hold2}s
                    </div>
                  </button>
                );
              })}

              <div style={styles.dialogHint}>
                Timings are frontend defaults for now; you can later load them
                from your backend.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreathingBox;

/* ===================== STYLES ===================== */

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    height: "100vh",
    background: "#FAF7F2",
    padding: "clamp(10px, 1.6vw, 16px) clamp(12px, 3.2vw, 28px) 12px",
    fontFamily: "Georgia, serif",
    position: "relative", //
    overflow: "hidden",
  },

  /* 🌿 BACKGROUND IMAGE STYLE */
  bgImage: {
    position: "absolute",
    top: "0px",
    right: "0px",
    width: "min(100vw, 820px)",
    opacity: 0.4,
    zIndex: 0,
    pointerEvents: "none",
  },

  headerRow: {
    display: "grid",
    gridTemplateColumns: "56px 1fr 56px",
    alignItems: "center",
    position: "relative",
    zIndex: 1,
    marginBottom: "6px",
  },

  backBtn: {
    width: "44px",
    height: "44px",
    borderRadius: "999px",
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.75)",
    cursor: "pointer",
    fontSize: "22px",
    lineHeight: 1,
  },

  headerCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
  },

  headerDivider: {
    width: "92%",
    maxWidth: "980px",
    height: "1px",
    background: "rgba(0,0,0,0.08)",
  },

  headerSpacer: {
    width: "44px",
    height: "44px",
  },

  title: {
    fontSize: "clamp(24px, 4vw, 34px)",
    margin: 0,
  },

  cycleRow: {
    display: "flex",
    justifyContent: "center",
    position: "relative",
    zIndex: 1,
    marginBottom: "10px",
  },

  cycleCardWide: {
    width: "420px",
    maxWidth: "92%",
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(167,196,160,0.8)",
    borderRadius: "10px",
    padding: "10px 14px",
    textAlign: "center",
  },

  cycleLabel: {
    fontSize: "18px",
  },

  cycleValue: {
    fontSize: "18px",
    fontWeight: 700,
  },

  mainGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
    gap: "clamp(14px, 3vw, 26px)",
    alignItems: "start",
    position: "relative",
    zIndex: 1,
    paddingTop: "0px",
  },

  left: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "10px",
  },

  circle: {
    width: "clamp(210px, 40vh, 290px)",
    height: "clamp(210px, 40vh, 290px)",
    borderRadius: "50%",
    background: "#DCEAD7",
    border: "2px solid #8FA98F",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 4s ease-in-out, box-shadow 0.8s ease",
  },

  active: {
    boxShadow: "0 0 45px rgba(143,169,143,0.55)",
  },

  inhale: {
    transform: "scale(1.16)",
  },

  exhale: {
    transform: "scale(0.86)",
  },

  icon: {
    height: "48px",
    marginBottom: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  phase: {
    fontSize: "clamp(20px, 3.5vw, 26px)",
    fontWeight: "bold",
  },

  timer: {
    fontSize: "clamp(14px, 2.2vw, 18px)",
    color: "#5F5F5F",
  },

  startBtn: {
    padding: "12px 54px",
    fontSize: "18px",
    background: "#8FA98F",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },

  controlsRow: {
    marginTop: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    width: "100%",
  },

  pauseBtn: {
    padding: "12px 28px",
    fontSize: "16px",
    background: "#8FA98F",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },

  pauseBtnPaused: {
    background: "rgba(255,255,255,0.78)",
    border: "1px solid rgba(167,196,160,0.8)",
    color: "rgba(0,0,0,0.78)",
  },

  stopBtn: {
    padding: "12px 28px",
    fontSize: "16px",
    background: "rgba(255,255,255,0.78)",
    color: "rgba(0,0,0,0.78)",
    border: "1px solid rgba(0,0,0,0.14)",
    borderRadius: "14px",
    cursor: "pointer",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },

  right: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    paddingTop: "10px",
  },

  infoBoxLarge: {
    background: "#DCEAD7",
    borderRadius: "8px",
    padding: "18px 20px",
    minHeight: "210px",
    border: "2px solid rgba(143,169,143,0.35)",
  },

  infoTitle: {
    fontSize: "clamp(18px, 3vw, 24px)",
    marginBottom: "10px",
  },

  infoText: {
    fontSize: "clamp(14px, 1.7vw, 16px)",
    lineHeight: "1.6",
  },

  patternRow: {
    marginTop: "16px",
    display: "flex",
    justifyContent: "flex-start",
  },

  patternBtn: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.72)",
    cursor: "pointer",
    fontSize: "16px",
  },

  benefitsSection: {
    position: "relative",
    zIndex: 1,
    marginTop: "14px",
    paddingBottom: "0px",
  },

  benefitsTitle: {
    fontSize: "clamp(18px, 3vw, 24px)",
    marginBottom: "10px",
  },

  benefits: {
    display: "flex",
    flexWrap: "wrap",
    gap: "clamp(8px, 1.6vw, 12px)",
  },

  pill: {
    padding: "clamp(6px, 1.2vw, 8px) clamp(12px, 1.8vw, 18px)",
    borderRadius: "24px",
    fontSize: "clamp(13px, 1.7vw, 14px)",
  },

  dialogOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    padding: "18px",
  },

  dialogCard: {
    width: "560px",
    maxWidth: "100%",
    background: "rgba(255,255,255,0.95)",
    borderRadius: "16px",
    border: "1px solid rgba(0,0,0,0.12)",
    boxShadow: "0 22px 65px rgba(0,0,0,0.25)",
    overflow: "hidden",
  },

  dialogHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
  },

  dialogTitle: {
    fontSize: "20px",
    fontWeight: 700,
  },

  dialogClose: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.85)",
    cursor: "pointer",
    fontSize: "16px",
  },

  dialogBody: {
    padding: "14px 16px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  dialogOption: {
    textAlign: "left",
    borderRadius: "14px",
    padding: "12px 14px",
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(250,247,242,0.7)",
    cursor: "pointer",
  },

  dialogOptionActive: {
    border: "1px solid rgba(143,169,143,0.7)",
    background: "rgba(220,234,215,0.75)",
  },

  dialogOptionTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "6px",
  },

  dialogBadge: {
    fontSize: "12px",
    padding: "4px 10px",
    borderRadius: "999px",
    border: "1px solid rgba(0,0,0,0.12)",
    background: "rgba(255,255,255,0.8)",
  },

  dialogOptionSub: {
    fontSize: "14px",
    color: "rgba(0,0,0,0.65)",
  },

  dialogHint: {
    marginTop: "6px",
    fontSize: "12px",
    color: "rgba(0,0,0,0.55)",
  },
};
