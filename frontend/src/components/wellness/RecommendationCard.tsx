import React from "react";
import { motion } from "framer-motion";

interface Recommendation {
  knowledge_id: string;
  title: string;
  content_type: string;
  duration_minutes: number | null;
  why: string;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  onSelect?: (id: string) => void;
}

const DOSHA_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  vata: { bg: "#E0E7FF", border: "#6366F1", text: "#4338CA" },
  pitta: { bg: "#FEE2E2", border: "#EF4444", text: "#DC2626" },
  kapha: { bg: "#DCFCE7", border: "#10B981", text: "#059669" },
  default: { bg: "#FFF3D9", border: "#F0C08A", text: "#92400E" },
};

const CONTENT_TYPE_ICONS: Record<string, string> = {
  breathing: "🌬️",
  meditation: "🧘",
  yoga: "🧘‍♀️",
  exercise: "🏃",
  music: "🎵",
  tea: "🍵",
  food: "🍽️",
  activity: "✨",
  practice: "📿",
  routine: "⏰",
  default: "💡",
};

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onSelect,
}) => {
  const { knowledge_id, title, content_type, duration_minutes, why } =
    recommendation;

  // Determine dosha from title or content_type (simple heuristic)
  const doshaType = title.toLowerCase().includes("vata")
    ? "vata"
    : title.toLowerCase().includes("pitta")
      ? "pitta"
      : title.toLowerCase().includes("kapha")
        ? "kapha"
        : "default";

  const colors = DOSHA_COLORS[doshaType];
  const icon =
    CONTENT_TYPE_ICONS[content_type.toLowerCase()] ||
    CONTENT_TYPE_ICONS["default"];

  const handleClick = () => {
    if (onSelect) {
      onSelect(knowledge_id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}40`,
        borderRadius: "14px",
        padding: "14px 16px",
        cursor: onSelect ? "pointer" : "default",
        boxShadow: `0 2px 10px ${colors.border}15`,
        transition: "all 0.2s ease",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Georgia', serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          marginBottom: "8px",
        }}
      >
        <span style={{ fontSize: "24px", flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <h4
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 600,
              color: colors.text,
              lineHeight: 1.3,
            }}
          >
            {title}
          </h4>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "4px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: colors.text,
                opacity: 0.8,
                textTransform: "capitalize",
              }}
            >
              {content_type}
            </span>
            {duration_minutes && (
              <>
                <span style={{ color: colors.text, opacity: 0.5 }}>•</span>
                <span
                  style={{
                    fontSize: "12px",
                    color: colors.text,
                    opacity: 0.8,
                  }}
                >
                  {duration_minutes} min
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      {why && (
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            color: colors.text,
            opacity: 0.9,
            lineHeight: 1.5,
          }}
        >
          {why}
        </p>
      )}
    </motion.div>
  );
};

export default RecommendationCard;
