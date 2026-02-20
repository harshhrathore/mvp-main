import { pool } from "../config/db";
import { SafetyCheckResult, HelplineInfo } from "../types";

// ── KEYWORD LISTS BY SEVERITY 
const CRITICAL_KEYWORDS = [
  "kill myself", "suicide", "end my life", "want to die",
  "no reason to live", "better off dead", "end it all",
  "take my own life", "don't want to live",
];

const HIGH_KEYWORDS = [
  "cut myself", "hurt myself", "self harm", "self-harm",
  "harm myself", "punish myself", "injure myself",
  "starve myself", "overdose",
];

const MEDIUM_KEYWORDS = [
  "can't go on", "give up", "hopeless", "no way out",
  "everything is pointless", "nothing matters",
  "can't take it anymore", "fed up with life",
];

// ── INDIAN HELPLINES 
export const HELPLINES: HelplineInfo[] = [
  {
    name: "Vandrevala Foundation",
    number: "1860-2662-345",
    hours: "24 × 7",
    languages: ["English", "Hindi"],
  },
  {
    name: "iCall (TISS)",
    number: "9152987821",
    hours: "8 AM – 10 PM",
    languages: ["English", "Hindi"],
  },
  {
    name: "AASRA",
    number: "91-9820466726",
    hours: "24 × 7",
    languages: ["English", "Hindi", "Marathi"],
  },
  {
    name: "Snehi",
    number: "044-24640050",
    hours: "9 AM – 11 PM",
    languages: ["English", "Hindi", "Tamil"],
  },
];

//  DETECT CRISIS FROM TEXT 
export const detectCrisis = (text: string): SafetyCheckResult => {
  const lower = text.toLowerCase();

  const criticalHits = CRITICAL_KEYWORDS.filter((k) => lower.includes(k));
  const highHits      = HIGH_KEYWORDS.filter((k) => lower.includes(k));
  const mediumHits    = MEDIUM_KEYWORDS.filter((k) => lower.includes(k));

  if (criticalHits.length > 0) {
    return {
      is_crisis: true,
      crisis_level: "critical",
      detected_keywords: criticalHits,
      confidence: 0.95,
    };
  }
  if (highHits.length > 0) {
    return {
      is_crisis: true,
      crisis_level: "high",
      detected_keywords: highHits,
      confidence: 0.85,
    };
  }
  if (mediumHits.length > 0) {
    return {
      is_crisis: true,
      crisis_level: "medium",
      detected_keywords: mediumHits,
      confidence: 0.70,
    };
  }

  return { is_crisis: false, crisis_level: "low", detected_keywords: [], confidence: 0 };
};

//  LOG to DB 
export const logSafetyEvent = async (
  userId: string,
  messageId: string | null,
  check: SafetyCheckResult
): Promise<void> => {
  await pool.query(
    `INSERT INTO safety_monitoring
       (user_id, message_id, trigger_type, detected_keywords, crisis_level, confidence_score,
        protocol_activated, helpline_suggested)
     VALUES ($1, $2, 'keywords', $3, $4, $5, $6, $7)`,
    [
      userId,
      messageId,
      check.detected_keywords,
      check.crisis_level,
      check.confidence,
      check.is_crisis,
      check.is_crisis,
    ]
  );
};

// ── BUILD CRISIS RESPONSE TEXT 
export const buildCrisisResponse = (level: string): string => {
  const base =

    "I can hear that you're going through a really painful time, and I want you to know " +
    "that what you're feeling is valid. You are not alone.\n\n" +
    "Please reach out to one of these helplines right now — they are trained to listen:\n\n" +
    "Vandrevala Foundation: 1860-2662-345 (24×7)\n" +
    "iCall (TISS): 9152987821 (8 AM – 10 PM)\n" +
    "AASRA: 91-9820466726 (24×7)\n\n";

  if (level === "critical") {
    return base + "If you are in immediate danger, please call 112 (emergency) right now.";
  }
  return base + "You deserve support. Would you like to talk about what's going on?";
};