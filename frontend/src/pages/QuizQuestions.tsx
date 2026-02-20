import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";

const totalQuestions = 15;

const quizBgUrl = new URL("../assets/quiz-bg.png", import.meta.url).toString();

const buildPlaceholderQuestions = () => [
  {
    id: 1,
    title: "Body Frame",
    prompt: "How would you describe your natural body frame?",
    options: [
      "Thin, lean, hard to gain weight",
      "Medium build, athletic, moderate weight",
      "Large frame, solid build, easy to gain weight",
    ],
  },
  {
    id: 2,
    title: "Skin Type",
    prompt: "What is your skin's natural tendency?",
    options: [
      "Dry, rough, thin, gets flaky easily",
      "Warm, oily, soft, prone to redness",
      "Moist, smooth, thick, well-hydrated",
    ],
  },
  {
    id: 3,
    title: "Hair Type",
    prompt: "How would you describe your natural hair?",
    options: [
      "Dry, coarse, frizzy, thin strands",
      "Fine, straight, oily at roots, early graying",
      "Thick, lustrous, wavy, naturally oily",
    ],
  },
  {
    id: 4,
    title: "Weight Pattern",
    prompt: "What is your lifelong weight pattern?",
    options: [
      "Underweight, hard to gain, lose easily",
      "Moderate weight, gain and lose relatively easily",
      "Overweight, hard to lose, gain easily",
    ],
  },
  {
    id: 5,
    title: "Joint Structure",
    prompt: "How would you describe your joints?",
    options: [
      "Small, prominent, crack easily, thin",
      "Medium, flexible, moderate size",
      "Large, well-padded, stable, strong",
    ],
  },
  {
    id: 6,
    title: "Digestion",
    prompt: "How is your digestion typically?",
    options: [
      "Variable/irregular, bloating, gas",
      "Strong, fast, burns hot",
      "Slow, heavy feeling after eating",
    ],
  },
  {
    id: 7,
    title: "Sleep Pattern",
    prompt: "How is your sleep pattern?",
    options: [
      "Light, interrupted, hard to fall asleep",
      "Moderate, wake refreshed",
      "Deep, long, hard to wake up",
    ],
  },
  {
    id: 8,
    title: "Energy Levels",
    prompt: "How is your energy throughout the day?",
    options: [
      "Comes in bursts, crashes, variable",
      "High and steady when fueled",
      "Steady and enduring",
    ],
  },
  {
    id: 9,
    title: "Temperature Preference",
    prompt: "What is your body temperature preference?",
    options: [
      "Always cold, need warmth",
      "Run hot, prefer cool environments",
      "Comfortable in most temperatures",
    ],
  },
  {
    id: 10,
    title: "Appetite",
    prompt: "How is your appetite?",
    options: [
      "Variable, sometimes forget to eat",
      "Strong, get angry when hungry",
      "Low, can skip meals easily",
    ],
  },
  {
    id: 11,
    title: "Stress Response",
    prompt: "How do you handle stress?",
    options: [
      "Anxious, worried, restless, racing mind",
      "Irritable, frustrated, angry",
      "Withdrawn, sad, avoidant",
    ],
  },
  {
    id: 12,
    title: "Decision Making",
    prompt: "How do you make decisions?",
    options: [
      "Quickly but change mind often, indecisive",
      "Decisively and stick to it",
      "Slowly, need time to process",
    ],
  },
  {
    id: 13,
    title: "Memory",
    prompt: "How is your memory?",
    options: [
      "Quick to learn, quick to forget",
      "Sharp and focused",
      "Slow to learn but long retention",
    ],
  },
  {
    id: 14,
    title: "Speech Pattern",
    prompt: "How do you speak?",
    options: [
      "Fast, talk a lot, jump between topics",
      "Clear, direct, precise",
      "Slow, thoughtful, deliberate",
    ],
  },
  {
    id: 15,
    title: "New Activities",
    prompt: "How do you approach new activities?",
    options: [
      "Excited, enthusiastic, but don't finish",
      "Goal-oriented, competitive",
      "Cautious, need encouragement",
    ],
  },
];

const QuizQuestions: React.FC = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);

  const [answers, setAnswers] = useState<Record<number, string>>({});

  const [interludeOpen, setInterludeOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState<number | null>(null);

  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);

  const questions = buildPlaceholderQuestions();
  const activeQuestion = questions[currentQuestion - 1];

  const isModalOpen = interludeOpen || analysisOpen;

  const optionAccents = useMemo(
    () => [
      { bg: "#7d9b7f", border: "#7d9b7f" },
      { bg: "#D68A6A", border: "#D68A6A" },
      { bg: "#A7CDA9", border: "#7d9b7f" },
      { bg: "#F5BDA6", border: "#D68A6A" },
    ],
    [],
  );

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

  useEffect(() => {
    if (!analysisOpen || analysisDone) return;
    const timer = window.setTimeout(() => setAnalysisDone(true), 10_000);
    return () => window.clearTimeout(timer);
  }, [analysisOpen, analysisDone]);

  const commitAnswer = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (isModalOpen) return;
    if (!selected) return;

    commitAnswer(activeQuestion.id, selected);

    if (currentQuestion === 5) {
      setPendingQuestion(6);
      setInterludeOpen(true);
      setReviewOpen(false);
      setSelected(null);
      return;
    }

    if (currentQuestion < totalQuestions) {
      setCurrentQuestion((prev) => prev + 1);
      setSelected(null);
      return;
    }

    setAnalysisOpen(true);
    setAnalysisDone(false);
    setSelected(null);
  };

  const handleInterludeContinue = () => {
    const next = pendingQuestion ?? currentQuestion + 1;
    setInterludeOpen(false);
    setReviewOpen(false);
    setPendingQuestion(null);
    setCurrentQuestion(Math.min(next, totalQuestions));
  };

  const handleAnalysisContinue = () => {
    setAnalysisOpen(false);
    setAnalysisDone(false);
    // Placeholder until quiz scoring is wired to the backend.
    navigate("/result", {
      state: {
        source: "quiz",
        primary: "vata",
        scores: { vata: 48, pitta: 32, kapha: 20 },
      },
    });
  };

  const reviewAnswers = useMemo(() => {
    const max = Math.min(5, totalQuestions);
    return Array.from({ length: max }, (_, i) => {
      const q = i + 1;
      return { id: q, value: answers[q] ?? "—" };
    });
  }, [answers]);

  const Wave = () => (
    <div className="flex items-center justify-center gap-2" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-[#7d9b7f]"
          animate={{ y: [0, -8, 0], opacity: [0.55, 1, 0.55] }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.08,
          }}
        />
      ))}
    </div>
  );

  return (
    <div
      className="h-screen bg-cover bg-no-repeat overflow-hidden"
      style={{
        backgroundImage: `url(${quizBgUrl})`,
        backgroundPosition: "50% 40%",
      }}
    >
      {/* MODALS */}
      <AnimatePresence>
        {interludeOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="relative w-full max-w-xl bg-white/85 backdrop-blur-md border border-black/10 rounded-2xl shadow-xl p-5 sm:p-6"
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.99 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
              role="dialog"
              aria-modal="true"
              aria-label="Quiz checkpoint"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xl sm:text-2xl font-serif text-gray-900">
                    Great progress!
                  </div>
                  <div className="mt-2 text-sm sm:text-base text-gray-700 leading-relaxed">
                    You've completed the physical trait questions. Now we'll
                    explore your physiological and behavioral patterns for a
                    complete assessment.
                  </div>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/70 border border-black/10 flex items-center justify-center flex-none">
                  <Leaf size={18} className="text-black/70" />
                </div>
              </div>

              <div className="mt-4 bg-white/70 border border-black/10 rounded-2xl p-4">
                <div className="text-xs uppercase tracking-wide text-black/50">
                  Preliminary indication
                </div>
                <div className="mt-1 text-base sm:text-lg font-semibold text-gray-900">
                  Strong Vata tendencies
                </div>
                <div className="mt-3 text-sm text-gray-700">
                  Next: Questions about digestion, sleep, energy, and lifestyle
                  patterns
                </div>
              </div>

              <AnimatePresence mode="wait">
                {reviewOpen ? (
                  <motion.div
                    key="review"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="mt-4"
                  >
                    <div className="text-sm font-semibold text-gray-900">
                      Review my answers
                    </div>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {reviewAnswers.map((a) => (
                        <div
                          key={a.id}
                          className="bg-white/70 border border-black/10 rounded-xl px-3 py-2 text-sm text-gray-800"
                        >
                          <span className="text-black/60">Q{a.id}:</span>{" "}
                          {a.value}
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row gap-3">
                      <motion.button
                        type="button"
                        onClick={() => setReviewOpen(false)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/70 border border-black/10 text-gray-900 press"
                      >
                        Back
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={handleInterludeContinue}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full sm:flex-1 px-5 py-2.5 rounded-xl bg-[#7d9b7f] text-white press"
                      >
                        Continue →
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="actions"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="mt-5 flex flex-col sm:flex-row gap-3"
                  >
                    <motion.button
                      type="button"
                      onClick={handleInterludeContinue}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full sm:flex-1 px-5 py-2.5 rounded-xl bg-[#7d9b7f] text-white press"
                    >
                      Continue →
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setReviewOpen(true)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full sm:flex-1 px-5 py-2.5 rounded-xl bg-white/70 border border-black/10 text-gray-900 press"
                    >
                      Review my answers
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}

        {analysisOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className="relative w-full max-w-xl bg-white/85 backdrop-blur-md border border-black/10 rounded-2xl shadow-xl p-5 sm:p-6"
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.99 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
              role="dialog"
              aria-modal="true"
              aria-label="Analyzing constitution"
            >
              <div className="text-xl sm:text-2xl font-serif text-gray-900">
                Analyzing Your Constitution
              </div>

              <div className="mt-4 bg-white/70 border border-black/10 rounded-2xl p-5">
                <div className="text-sm text-gray-700">
                  Comparing patterns...
                </div>
                <div className="mt-4">
                  <Wave />
                </div>
                <div className="mt-4 text-sm text-gray-700">
                  with 5,000-year-old wisdom
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-700">
                This takes about 10 seconds.
              </div>

              <div className="mt-4 bg-white/70 border border-black/10 rounded-2xl p-4">
                <div className="text-sm font-semibold text-gray-900">
                  Did you know?
                </div>
                <div className="mt-1 text-sm text-gray-700 leading-relaxed">
                  Ayurveda recognizes 7 constitutional types: the 3 doshas and 4
                  combinations.
                </div>
              </div>

              <AnimatePresence mode="wait">
                {analysisDone ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="mt-5"
                  >
                    <div className="text-sm text-gray-700">
                      Analysis complete.
                    </div>
                    <motion.button
                      type="button"
                      onClick={handleAnalysisContinue}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="mt-3 w-full px-5 py-2.5 rounded-xl bg-[#7d9b7f] text-white press"
                    >
                      Continue →
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="wait"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="mt-5 text-xs text-black/50"
                  >
                    Please wait…
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className={
          "h-screen overflow-hidden bg-gradient-to-br from-[#eef5ea]/70 to-[#dfeee0]/70 px-3 sm:px-4 md:px-6 py-4 sm:py-5 " +
          (isModalOpen ? "pointer-events-none" : "")
        }
        variants={pageVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div
          className="mx-auto w-full max-w-4xl h-full flex flex-col"
          variants={itemVariants}
        >
          {/* Header */}
          <div className="flex items-end justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif leading-tight">
                Quick Quiz
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Choose one option to continue.
              </p>
            </div>
          </div>

          {/* Question Card (animates per-question) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              className="bg-white/80 border border-white/70 rounded-2xl px-4 sm:px-5 md:px-7 py-4 sm:py-5 mb-4 sm:mb-5"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="text-xl sm:text-2xl font-serif text-gray-900">
                {activeQuestion.prompt}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Options */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 flex-1 min-h-0"
            variants={itemVariants}
          >
            {activeQuestion.options.map((opt, idx) => {
              const isSelected = selected === opt;
              const accent = optionAccents[idx % optionAccents.length];
              return (
                <motion.button
                  key={opt}
                  onClick={() => setSelected(opt)}
                  className={
                    "relative w-full overflow-hidden rounded-xl border text-left px-4 sm:px-5 md:px-6 py-3 sm:py-4 transition " +
                    "press soft-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent " +
                    (isSelected
                      ? "bg-white text-gray-900 border-gray-300 focus:ring-[#7d9b7f]/35"
                      : "bg-white text-gray-900 border-gray-200 hover:border-[#7d9b7f] focus:ring-[#7d9b7f]/25")
                  }
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* Animated accent underlay (keeps the button itself neutral) */}
                  <motion.span
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{ background: accent.bg, transformOrigin: "0% 50%" }}
                    initial={false}
                    animate={{
                      opacity: isSelected ? 0.22 : 0,
                      scaleX: isSelected ? 1 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 28 }}
                  />

                  <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                    <span
                      className={
                        "h-4 w-4 rounded-full border flex-none transition " +
                        (isSelected
                          ? "bg-white border-white"
                          : "bg-transparent border-gray-300")
                      }
                      style={
                        isSelected
                          ? { boxShadow: `0 0 0 3px ${accent.bg}33` }
                          : undefined
                      }
                      aria-hidden="true"
                    />
                    <span className="text-base sm:text-lg">{opt}</span>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Next Button */}
          <div className="flex justify-center pt-4 sm:pt-5">
            <motion.button
              onClick={handleNext}
              className="bg-[#7d9b7f] hover:bg-[#6c8b6e] text-white text-base sm:text-lg px-9 sm:px-11 py-2.5 sm:py-3.5 rounded-full transition press disabled:opacity-50 disabled:hover:bg-[#7d9b7f]"
              disabled={!selected}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              {currentQuestion === totalQuestions ? "Continue" : "Next"}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default QuizQuestions;
