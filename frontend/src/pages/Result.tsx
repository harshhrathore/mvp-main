import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Leaf, RotateCcw } from "lucide-react";
import BackButton from "../components/BackButton";

type DoshaKey = "vata" | "pitta" | "kapha";

type ResultState = {
  primary?: DoshaKey;
  scores?: Partial<Record<DoshaKey, number>>;
  source?: "quiz" | "medical" | "unknown";
};

const quizBgUrl = new URL("../assets/quiz-bg.png", import.meta.url).toString();

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function normalizeScores(scores: Record<DoshaKey, number>) {
  const v = clamp(scores.vata, 0, 100);
  const p = clamp(scores.pitta, 0, 100);
  const k = clamp(scores.kapha, 0, 100);
  const sum = v + p + k;
  if (sum <= 0) return { vata: 34, pitta: 33, kapha: 33 };
  return {
    vata: Math.round((v / sum) * 100),
    pitta: Math.round((p / sum) * 100),
    kapha: Math.max(
      0,
      100 - Math.round((v / sum) * 100) - Math.round((p / sum) * 100),
    ),
  };
}

const Result: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as ResultState;

  const scores = useMemo(() => {
    const fallback = { vata: 48, pitta: 32, kapha: 20 };
    const raw = {
      vata: state.scores?.vata ?? fallback.vata,
      pitta: state.scores?.pitta ?? fallback.pitta,
      kapha: state.scores?.kapha ?? fallback.kapha,
    };
    return normalizeScores(raw);
  }, [state.scores?.kapha, state.scores?.pitta, state.scores?.vata]);

  const primary: DoshaKey = useMemo(() => {
    const p = state.primary;
    if (p === "vata" || p === "pitta" || p === "kapha") return p;
    const entries: Array<[DoshaKey, number]> = [
      ["vata", scores.vata],
      ["pitta", scores.pitta],
      ["kapha", scores.kapha],
    ];
    entries.sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0] ?? "vata";
  }, [scores.kapha, scores.pitta, scores.vata, state.primary]);

  const primaryLabel =
    primary === "vata" ? "Vata" : primary === "pitta" ? "Pitta" : "Kapha";
  const primarySummary =
    primary === "vata"
      ? "Light, quick, creative energy. When out of balance: restlessness, scattered focus, dryness."
      : primary === "pitta"
        ? "Sharp, driven, warm energy. When out of balance: irritability, overheating, intense self-critique."
        : "Steady, grounded, nourishing energy. When out of balance: heaviness, sluggishness, low motivation.";

  const pageVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
        when: "beforeChildren",
        staggerChildren: 0.06,
      },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
    },
  } as const;

  const bar = (label: string, value: number, color: string, index: number) => (
    <motion.div
      className="rounded-2xl bg-white/70 border border-black/10 p-4"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        scale: 1.02,
        y: -2,
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.08)",
        transition: { duration: 0.2 },
      }}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900 font-serif">
          {label}
        </div>
        <motion.div
          className="text-xs text-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.5 }}
        >
          {value}%
        </motion.div>
      </div>
      <div className="mt-3 h-2.5 rounded-full bg-black/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full relative overflow-hidden"
          style={{ background: color }}
          initial={{ width: "0%" }}
          animate={{ width: `${clamp(value, 0, 100)}%` }}
          transition={{
            duration: 1.2,
            delay: index * 0.1 + 0.3,
            ease: [0.34, 1.56, 0.64, 1], // Spring easing
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
            }}
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.5,
              delay: index * 0.1 + 1,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <div
      className="min-h-screen bg-cover bg-no-repeat"
      style={{
        backgroundImage: `url(${quizBgUrl})`,
        backgroundPosition: "50% 40%",
      }}
    >
      <motion.div
        className="min-h-screen bg-gradient-to-br from-[#eef5ea]/75 to-[#dfeee0]/75 px-3 sm:px-4 md:px-6 py-5"
        variants={pageVariants}
        initial="hidden"
        animate="show"
      >
        <div className="mx-auto w-full max-w-5xl">
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between gap-3"
          >
            <BackButton />
            <div className="flex items-center gap-2 text-xs text-black/60">
              <Leaf className="w-4 h-4" />
              <span>
                {state.source ? `Source: ${state.source}` : "Source: quiz"}
              </span>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-4 rounded-3xl bg-white/80 border border-white/70 shadow-sm p-6 sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif text-gray-900 leading-tight">
                  Your constitution snapshot
                </h1>
                <p className="mt-2 text-sm sm:text-base text-gray-700 max-w-2xl">
                  Result: <span className="font-semibold">{primaryLabel}</span>{" "}
                  pattern detected. {primarySummary}
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-white/70 border border-black/10 flex items-center justify-center flex-none">
                <Leaf className="w-5 h-5 text-black/70" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
              {bar("Vata", scores.vata, "#7d9b7f", 0)}
              {bar("Pitta", scores.pitta, "#D68A6A", 1)}
              {bar("Kapha", scores.kapha, "#A7CDA9", 2)}
            </div>

            <div className="mt-5 rounded-2xl bg-white/70 border border-black/10 p-5">
              <div className="text-sm font-semibold text-gray-900 font-serif">
                What to do next
              </div>
              <div className="mt-2 text-sm text-gray-700 leading-relaxed">
                Pick one small action. SAMA works best with calm consistency.
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <motion.button
                  type="button"
                  onClick={() => navigate("/ayurveda")}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="px-4 py-3 rounded-2xl bg-white/70 border border-black/10 press text-left"
                >
                  <div className="text-sm font-semibold">
                    Ayurveda dashboard
                  </div>
                  <div className="mt-1 text-xs text-black/60">
                    Personalized suggestions by time of day
                  </div>
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => navigate("/ai-wellness-guide")}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="px-4 py-3 rounded-2xl bg-white/70 border border-black/10 press text-left"
                >
                  <div className="text-sm font-semibold">Sama Wellness</div>
                  <div className="mt-1 text-xs text-black/60">
                    Short practices for your current state
                  </div>
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => navigate("/breathing")}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="px-4 py-3 rounded-2xl bg-white/70 border border-black/10 press text-left"
                >
                  <div className="text-sm font-semibold">Breathwork</div>
                  <div className="mt-1 text-xs text-black/60">
                    Reset your nervous system in minutes
                  </div>
                </motion.button>
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <motion.button
                type="button"
                onClick={() => navigate("/dashboard")}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full sm:flex-1 px-5 py-3 rounded-2xl bg-[#7d9b7f] text-white press inline-flex items-center justify-center gap-2"
              >
                Go to dashboard <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                type="button"
                onClick={() => navigate("/quiz-intro")}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/70 border border-black/10 press inline-flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Retake quiz
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Result;
