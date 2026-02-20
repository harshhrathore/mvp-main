import React, { useState } from "react";
import { motion } from "framer-motion";

interface CrisisHelplineProps {
  crisisLevel: string;
}

const CrisisHelpline: React.FC<CrisisHelplineProps> = ({ crisisLevel }) => {
  const [acknowledged, setAcknowledged] = useState(false);

  const isHighCrisis = crisisLevel === "high" || crisisLevel === "severe";

  if (acknowledged) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          backgroundColor: "#DCFCE7",
          border: "1px solid #10B981",
          borderRadius: "14px",
          padding: "12px 16px",
          textAlign: "center",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Georgia', serif",
        }}
      >
        <span style={{ fontSize: "18px", marginRight: "8px" }}>✓</span>
        <span style={{ fontSize: "14px", color: "#059669", fontWeight: 500 }}>
          Thank you for letting us know you're safe. We're here for you.
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        backgroundColor: isHighCrisis ? "#FEE2E2" : "#FEF3C7",
        border: `2px solid ${isHighCrisis ? "#DC2626" : "#F59E0B"}`,
        borderRadius: "16px",
        padding: "18px 20px",
        boxShadow: `0 4px 16px ${isHighCrisis ? "#DC262640" : "#F59E0B40"}`,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Georgia', serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "14px",
        }}
      >
        <span style={{ fontSize: "28px" }}>🆘</span>
        <h3
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: 700,
            color: isHighCrisis ? "#991B1B" : "#92400E",
          }}
        >
          {isHighCrisis
            ? "Immediate Help Available"
            : "Support Resources Available"}
        </h3>
      </div>

      {/* Message */}
      <p
        style={{
          margin: "0 0 16px 0",
          fontSize: "14px",
          color: isHighCrisis ? "#7F1D1D" : "#78350F",
          lineHeight: 1.6,
        }}
      >
        {isHighCrisis
          ? "If you're in immediate danger or having thoughts of self-harm, please reach out to these resources right away. You don't have to face this alone."
          : "It sounds like you're going through a difficult time. These resources are here to support you."}
      </p>

      {/* Emergency Hotlines */}
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          borderRadius: "12px",
          padding: "14px",
          marginBottom: "12px",
        }}
      >
        <h4
          style={{
            margin: "0 0 10px 0",
            fontSize: "15px",
            fontWeight: 600,
            color: isHighCrisis ? "#991B1B" : "#92400E",
          }}
        >
          📞 Emergency Hotlines
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ fontSize: "14px", color: "#1F2937" }}>
            <strong>National Suicide Prevention Lifeline:</strong>
            <br />
            <a
              href="tel:988"
              style={{
                color: "#2563EB",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "16px",
              }}
            >
              988
            </a>{" "}
            (24/7 Support)
          </div>
          <div style={{ fontSize: "14px", color: "#1F2937" }}>
            <strong>Crisis Text Line:</strong>
            <br />
            Text <strong>HELLO</strong> to{" "}
            <a
              href="sms:741741"
              style={{
                color: "#2563EB",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              741741
            </a>
          </div>
          <div style={{ fontSize: "14px", color: "#1F2937" }}>
            <strong>International Association for Suicide Prevention:</strong>
            <br />
            <a
              href="https://www.iasp.info/resources/Crisis_Centres/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2563EB", textDecoration: "underline" }}
            >
              Find your country's helpline
            </a>
          </div>
        </div>
      </div>

      {/* Additional Resources */}
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          borderRadius: "12px",
          padding: "14px",
          marginBottom: "14px",
        }}
      >
        <h4
          style={{
            margin: "0 0 10px 0",
            fontSize: "15px",
            fontWeight: 600,
            color: isHighCrisis ? "#991B1B" : "#92400E",
          }}
        >
          💬 Additional Support
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ fontSize: "13px", color: "#1F2937" }}>
            • Call emergency services (911) if in immediate danger
          </div>
          <div style={{ fontSize: "13px", color: "#1F2937" }}>
            • Visit your nearest emergency room
          </div>
          <div style={{ fontSize: "13px", color: "#1F2937" }}>
            • Reach out to a trusted friend or family member
          </div>
          <div style={{ fontSize: "13px", color: "#1F2937" }}>
            • Contact your mental health provider
          </div>
        </div>
      </div>

      {/* Acknowledgment Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setAcknowledged(true)}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: isHighCrisis ? "#DC2626" : "#F59E0B",
          color: "#FFFFFF",
          border: "none",
          borderRadius: "12px",
          fontSize: "15px",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Georgia', serif",
        }}
      >
        I'm Safe / I've Reached Out for Help
      </motion.button>
    </motion.div>
  );
};

export default CrisisHelpline;
