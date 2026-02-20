import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useOnboardingFlow } from "../hooks/useOnboardingFlow";
import bgImage from "../assets/onboarding-bg.png";

const GOALS = [
  { id: 0, emoji: "🧘", title: "Stress & Anxiety" },
  { id: 1, emoji: "🔥", title: "Anger Control" },
  { id: 2, emoji: "🌧️", title: "Sadness / Low Mood" },
  { id: 3, emoji: "🌙", title: "Better Sleep" },
  { id: 4, emoji: "🩺", title: "Diabetes" },
  { id: 5, emoji: "🧍", title: "Pain & Posture" },
] as const;

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
} as const;

const OnboardingGoals: React.FC = () => {
  const [selected, setSelected] = useState<number[]>([]);
  const navigate = useNavigate();
  const { markOnboardingComplete } = useOnboardingFlow();

  const toggleSelect = (index: number) => {
    setSelected((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const handleContinue = () => {
    // Mark onboarding as complete
    markOnboardingComplete();
    // Navigate to dashboard
    navigate('/dashboard', { replace: true });
  };

  return (
    <motion.div
      style={styles.page}
      variants={pageVariants}
      initial="hidden"
      animate="show"
    >
      {/* Background Image */}
      <img src={bgImage} alt="background" style={styles.bgImage} />

      {/* Content */}
      <motion.div style={styles.content} variants={itemVariants}>
        <h1 style={styles.title}>What brings you to SAMA?</h1>
        <p style={styles.subtitle}>Select your primary goals</p>

        {/* Cards Grid */}
        <motion.div style={styles.grid} variants={itemVariants}>
          {GOALS.map((goal) => {
            const isSelected = selected.includes(goal.id);
            return (
              <motion.div
                key={goal.id}
                onClick={() => toggleSelect(goal.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleSelect(goal.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                variants={itemVariants}
                whileHover={{
                  scale: isSelected ? 1.045 : 1.02,
                  boxShadow: isSelected
                    ? "0 12px 26px rgba(0,0,0,0.14)"
                    : "0 10px 22px rgba(0,0,0,0.10)",
                }}
                whileTap={{ scale: isSelected ? 1.03 : 1.005 }}
                animate={{ scale: isSelected ? 1.04 : 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                style={
                  {
                    ...styles.card,
                    ...(isSelected ? styles.cardSelected : {}),
                    background: isSelected ? "#E9FBF7" : styles.card.background,
                  } as React.CSSProperties
                }
              >
                <div style={styles.cardBgLayer} aria-hidden="true">
                  <span style={styles.cardBgEmoji}>{goal.emoji}</span>
                </div>

                <div style={styles.cardContent}>
                  <div style={styles.cardEmoji} aria-hidden="true">
                    {goal.emoji}
                  </div>
                  <div style={styles.cardTitle}>{goal.title}</div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Continue Button */}
        <motion.button
          style={styles.continueBtn}
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={handleContinue}
        >
          Continue
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default OnboardingGoals;

/* ===================== STYLES ===================== */

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    position: "relative",
    height: "100vh",
    background: "#FAF7F2",
    fontFamily: "Georgia, serif",
    overflow: "hidden",
  },

  /* BACKGROUND IMAGE */
  bgImage: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: 0.55,
    zIndex: 0,
  },

  /* CONTENT */
  content: {
    position: "relative",
    zIndex: 1,
    maxWidth: "1000px",
    margin: "0 auto",
    padding:
      "clamp(14px, 2.6vh, 22px) clamp(14px, 3vw, 22px) clamp(12px, 2.4vh, 18px)",
    textAlign: "center",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  title: {
    fontSize: "clamp(24px, 4vw, 34px)",
    marginBottom: "2px",
  },

  subtitle: {
    fontSize: "clamp(16px, 2.5vw, 20px)",
    marginBottom: "clamp(8px, 1.5vh, 12px)",
  },

  stepBadge: {
    display: "inline-block",
    background: "rgba(143, 169, 143, 0.25)",
    color: "#4a6a4c",
    padding: "6px 16px",
    borderRadius: "20px",
    fontSize: "clamp(13px, 2vw, 15px)",
    fontWeight: 600,
    marginBottom: "clamp(12px, 2.2vh, 18px)",
  },

  progressIndicator: {
    position: "absolute",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 10,
  },

  progressBar: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  progressStepComplete: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#7d9b7f",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: 600,
  },

  progressStepActive: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#7d9b7f",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: 600,
  },

  progressLineComplete: {
    width: "48px",
    height: "4px",
    background: "#7d9b7f",
    borderRadius: "2px",
  },

  /* GRID */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "clamp(10px, 2vw, 16px)",
    justifyItems: "stretch",
    marginBottom: "clamp(14px, 2.2vh, 18px)",
    alignContent: "center",
    flex: "1 1 auto",
  },

  /* CARD */
  card: {
    width: "100%",
    maxWidth: "none",
    height: "clamp(132px, 18vw, 160px)",
    background: "#F6F2EF",
    borderRadius: "clamp(16px, 3vw, 22px)",
    border: "1.4px solid #8FA98F",
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease, border 0.2s ease",
    boxSizing: "border-box",
    padding: "clamp(12px, 2.2vw, 16px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    outline: "none",
    position: "relative",
    overflow: "hidden",
  },

  /* SELECTED CARD */
  cardSelected: {
    border: "2px solid #6F8F6F",
    boxShadow: "0 10px 22px rgba(0,0,0,0.12)",
  },

  cardBgLayer: {
    position: "absolute",
    inset: 0,
    display: "grid",
    placeItems: "center",
    pointerEvents: "none",
  },

  cardBgEmoji: {
    fontSize: "82px",
    opacity: 0.18,
    filter: "blur(3px)",
    transform: "translateY(-6px)",
  },

  cardContent: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  cardEmoji: {
    width: "50px",
    height: "50px",
    borderRadius: "999px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.65)",
    border: "1.2px solid rgba(143, 169, 143, 0.7)",
    fontSize: "26px",
    marginBottom: "10px",
    lineHeight: 1,
  },

  cardTitle: {
    fontSize: "clamp(15px, 2.2vw, 17px)",
    fontWeight: 700,
    lineHeight: 1.2,
    color: "#2C3A2C",
  },

  /* BUTTON */
  continueBtn: {
    background: "#8FA98F",
    color: "#FFFFFF",
    border: "none",
    borderRadius: "24px",
    padding: "clamp(10px, 1.8vh, 12px) clamp(18px, 3.2vw, 26px)",
    fontSize: "clamp(16px, 2.5vw, 20px)",
    cursor: "pointer",
    alignSelf: "center",
    width: "auto",
    display: "inline-flex",
    justifyContent: "center",
    whiteSpace: "nowrap",
  },
};
