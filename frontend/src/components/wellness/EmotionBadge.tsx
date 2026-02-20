import React from "react";
import { motion } from "framer-motion";

interface EmotionBadgeProps {
  emotion: string;
  intensity: number;
}

const EMOTION_CONFIG: Record<
  string,
  { color: string; bgColor: string; icon: string }
> = {
  joy: { color: "#F59E0B", bgColor: "#FEF3C7", icon: "😊" },
  happy: { color: "#F59E0B", bgColor: "#FEF3C7", icon: "😊" },
  sadness: { color: "#3B82F6", bgColor: "#DBEAFE", icon: "😢" },
  sad: { color: "#3B82F6", bgColor: "#DBEAFE", icon: "😢" },
  anger: { color: "#EF4444", bgColor: "#FEE2E2", icon: "😠" },
  angry: { color: "#EF4444", bgColor: "#FEE2E2", icon: "😠" },
  fear: { color: "#8B5CF6", bgColor: "#EDE9FE", icon: "😨" },
  anxious: { color: "#8B5CF6", bgColor: "#EDE9FE", icon: "😨" },
  anxiety: { color: "#8B5CF6", bgColor: "#EDE9FE", icon: "😨" },
  surprise: { color: "#EC4899", bgColor: "#FCE7F3", icon: "😲" },
  surprised: { color: "#EC4899", bgColor: "#FCE7F3", icon: "😲" },
  disgust: { color: "#10B981", bgColor: "#D1FAE5", icon: "😖" },
  calm: { color: "#8FA98F", bgColor: "#DCEAD7", icon: "😌" },
  peaceful: { color: "#8FA98F", bgColor: "#DCEAD7", icon: "😌" },
  excited: { color: "#F97316", bgColor: "#FFEDD5", icon: "🤩" },
  neutral: { color: "#6B7280", bgColor: "#F3F4F6", icon: "😐" },
  confused: { color: "#A855F7", bgColor: "#F3E8FF", icon: "😕" },
  frustrated: { color: "#DC2626", bgColor: "#FEE2E2", icon: "😤" },
  hopeful: { color: "#14B8A6", bgColor: "#CCFBF1", icon: "🙂" },
  grateful: { color: "#84CC16", bgColor: "#ECFCCB", icon: "🙏" },
  lonely: { color: "#6366F1", bgColor: "#E0E7FF", icon: "😔" },
  overwhelmed: { color: "#F43F5E", bgColor: "#FFE4E6", icon: "😰" },
};

const EmotionBadge: React.FC<EmotionBadgeProps> = ({ emotion, intensity }) => {
  const normalizedEmotion = emotion.toLowerCase();
  const config =
    EMOTION_CONFIG[normalizedEmotion] || EMOTION_CONFIG["neutral"];

  const intensityLabel =
    intensity >= 0.7 ? "Strong" : intensity >= 0.4 ? "Moderate" : "Mild";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        borderRadius: "12px",
        backgroundColor: config.bgColor,
        border: `1px solid ${config.color}40`,
        boxShadow: `0 2px 8px ${config.color}20`,
        fontSize: "14px",
        fontWeight: 500,
        color: config.color,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Georgia', serif",
      }}
    >
      <span style={{ fontSize: "18px" }}>{config.icon}</span>
      <span style={{ textTransform: "capitalize" }}>{emotion}</span>
      <span
        style={{
          fontSize: "12px",
          opacity: 0.8,
          marginLeft: "2px",
        }}
      >
        ({intensityLabel})
      </span>
    </motion.div>
  );
};

export default EmotionBadge;
