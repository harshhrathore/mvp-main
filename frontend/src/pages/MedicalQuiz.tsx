import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const quizBgUrl = new URL("../assets/quiz-bg.png", import.meta.url).toString();

type Question = {
  id: number;
  prompt: string;
  options: string[];
  multiSelect?: boolean;
};

const QUESTIONS: Question[] = [
  {
    id: 1,
    prompt:
      "Do you currently have any diagnosed medical conditions? (Select all that apply)",
    options: [
      "Diabetes",
      "High blood pressure",
      "Thyroid disorder",
      "PCOS / Hormonal imbalance",
      "Asthma / Respiratory issues",
      "Chronic pain (back, neck, joints)",
      "Heart condition",
      "None",
      "Prefer not to say",
      "Other",
    ],
    multiSelect: true,
  },
  {
    id: 2,
    prompt:
      "Have you ever been diagnosed with or treated for a mental health condition? (Select all that apply)",
    options: [
      "Anxiety",
      "Depression",
      "Panic disorder",
      "PTSD",
      "ADHD",
      "Sleep disorder",
      "No",
      "Prefer not to say",
      "Other",
    ],
    multiSelect: true,
  },
  {
    id: 3,
    prompt: "Are you currently taking any medication? (Select all that apply)",
    options: [
      "For physical health",
      "For mental health",
      "Hormonal medication",
      "No",
      "Prefer not to say",
    ],
    multiSelect: true,
  },
  {
    id: 4,
    prompt: "How would you describe your sleep quality?",
    options: [
      "Deep & refreshing",
      "Light sleep",
      "Difficulty falling asleep",
      "Wake up frequently",
      "Insomnia",
    ],
  },
  {
    id: 5,
    prompt: "When do you feel most low in energy?",
    options: [
      "Morning",
      "Afternoon",
      "Evening",
      "All day fatigue",
      "Energy fluctuates",
    ],
  },
  {
    id: 6,
    prompt: "Do you have any injuries or physical limitations? (Select all that apply)",
    options: [
      "Knee issues",
      "Back pain",
      "Neck stiffness",
      "Recent surgery",
      "Pregnancy",
      "None",
      "Other",
    ],
    multiSelect: true,
  },
  {
    id: 7,
    prompt: "Do you frequently experience any of these? (Select all that apply)",
    options: [
      "Bloating",
      "Acidity",
      "Constipation",
      "Loose motions",
      "Irregular appetite",
      "No digestive issues",
    ],
    multiSelect: true,
  },
  {
    id: 8,
    prompt: "In the past 2 weeks, how have you mostly felt?",
    options: [
      "Calm",
      "Stressed",
      "Anxious",
      "Low / demotivated",
      "Irritable",
      "Emotionally overwhelmed",
    ],
  },
  {
    id: 9,
    prompt: "When stressed, your body reacts with: (Select all that apply)",
    options: [
      "Fast heartbeat",
      "Shallow breathing",
      "Headache",
      "Muscle tightness",
      "Emotional shutdown",
      "Overthinking",
    ],
    multiSelect: true,
  },
  {
    id: 10,
    prompt: "What is your top wellness goal right now?",
    options: [
      "Reduce stress",
      "Improve sleep",
      "Heal emotionally",
      "Increase focus",
      "Balance hormones",
      "Improve digestion",
      "Build daily discipline",
    ],
  },
];

const MedicalQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string[]>>({});

  const activeQuestion = QUESTIONS[currentIndex];

  const activeSelections = answers[activeQuestion.id] || [];

  const optionAccents = useMemo(
    () => [
      { bg: "#7d9b7f" },
      { bg: "#D68A6A" },
      { bg: "#A7CDA9" },
      { bg: "#F5BDA6" },
    ],
    [],
  );

  const handleNext = () => {
    if (!activeSelections.length) return;

    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    // Mark medical quiz as completed so we only show it once for this user
    try {
      localStorage.setItem("sama_medical_quiz_completed", "true");
    } catch {
      // ignore storage errors
    }

    // Navigate to onboarding after completing medical quiz
    navigate("/onboarding-goals");
  };

  const toggleOption = (option: string) => {
    setAnswers((prev) => {
      const existing = prev[activeQuestion.id] || [];

      if (activeQuestion.multiSelect) {
        const isSelected = existing.includes(option);
        const next = isSelected
          ? existing.filter((o) => o !== option)
          : [...existing, option];
        return {
          ...prev,
          [activeQuestion.id]: next,
        };
      }

      // Single-select question
      return {
        ...prev,
        [activeQuestion.id]: [option],
      };
    });
  };

  return (
    <div
      className="h-screen bg-cover bg-no-repeat overflow-hidden"
      style={{
        backgroundImage: `url(${quizBgUrl})`,
        backgroundPosition: "50% 40%",
      }}
    >
      <motion.div
        className="h-screen overflow-hidden bg-gradient-to-br from-[#eef5ea]/70 to-[#dfeee0]/70 px-3 sm:px-4 md:px-6 py-4 sm:py-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto w-full max-w-4xl h-full flex flex-col">
          <div className="flex items-end justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif leading-tight">
                Medical Quiz
              </h2>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeQuestion.id}
              className="bg-white/80 border border-white/70 rounded-2xl px-4 sm:px-5 md:px-7 py-4 sm:py-5 mb-4 sm:mb-5 flex-shrink-0"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-3 flex-1 min-h-0 overflow-y-auto pb-4 pr-1">
            {activeQuestion.options.map((opt, idx) => {
              const isSelected = activeSelections.includes(opt);
              const accent = optionAccents[idx % optionAccents.length];

              return (
                <motion.button
                  key={opt}
                  onClick={() => toggleOption(opt)}
                  className={
                    "relative w-full overflow-hidden rounded-xl border text-left px-5 sm:px-6 md:px-7 py-3.5 sm:py-4 transition min-h-[52px] sm:min-h-[70px] " +
                    "press soft-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent " +
                    (isSelected
                      ? "bg-white text-gray-900 border-gray-300 focus:ring-[#7d9b7f]/35"
                      : "bg-white text-gray-900 border-gray-200 hover:border-[#7d9b7f] focus:ring-[#7d9b7f]/25")
                  }
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  type="button"
                >
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

                  <div className="relative z-10 flex items-start gap-3 sm:gap-4">
                    <span
                      className={
                        "h-4 w-4 rounded-full border flex-none transition mt-0.5 " +
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
                    <span className="text-sm sm:text-base leading-snug whitespace-normal">
                      {opt}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="flex justify-center pt-4 sm:pt-5 pb-2 flex-shrink-0">
            <motion.button
              onClick={handleNext}
              className="bg-[#7d9b7f] hover:bg-[#6c8b6e] text-white text-base sm:text-lg px-9 sm:px-11 py-2.5 sm:py-3.5 rounded-full transition press disabled:opacity-50 disabled:hover:bg-[#7d9b7f] shadow-lg"
              disabled={!activeSelections.length}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              type="button"
            >
              {currentIndex === QUESTIONS.length - 1 ? "Finish" : "Next"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MedicalQuiz;